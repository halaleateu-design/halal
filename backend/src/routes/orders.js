import { Router } from "express";
import { nanoid, customAlphabet } from "nanoid";
import db from "../db.js";
import { authMiddleware, requireRole, verifyToken, streamAuthMiddleware } from "../auth.js";
import {
  notifyCustomerOrderAccepted,
  notifyMerchantNewOrder,
  notifyRiderPoolEmails,
} from "../notify-email.js";
import { attachOrderSse, publishOrderEvent, riderStreamChannels } from "../order-stream.js";

const router = Router();
const genTrackingCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

function optionalAuth(req, _res, next) {
  req.user = undefined;
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
}

function normalizeCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function deliveryToTrackStatus(s) {
  if (s === "pending_restaurant" || s === "accepted") return "preparing";
  if (s === "rider_claimed") return "rider_assigned";
  if (["picked_up", "delivering", "delivered", "cancelled"].includes(s)) return s;
  return "preparing";
}

function syncOrderTracking(row) {
  const code = row.tracking_code;
  const status = deliveryToTrackStatus(row.status);
  const riderLat = row.rider_live_lat != null ? Number(row.rider_live_lat) : null;
  const riderLng = row.rider_live_lng != null ? Number(row.rider_live_lng) : null;
  const destLat = row.delivery_lat != null ? Number(row.delivery_lat) : null;
  const destLng = row.delivery_lng != null ? Number(row.delivery_lng) : null;

  const existing = db.prepare("SELECT id FROM order_tracking WHERE tracking_code = ?").get(code);
  if (existing) {
    db.prepare(
      `UPDATE order_tracking SET status = ?, restaurant_label = ?, customer_label = ?, dest_lat = ?, dest_lng = ?, rider_lat = ?, rider_lng = ?, updated_at = datetime('now') WHERE tracking_code = ?`
    ).run(
      status,
      row.restaurant_name || null,
      row.customer_display_name || null,
      destLat,
      destLng,
      riderLat,
      riderLng,
      code
    );
    return;
  }
  db.prepare(
    `INSERT INTO order_tracking (id, tracking_code, status, restaurant_label, customer_label, rider_lat, rider_lng, dest_lat, dest_lng, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(nanoid(), code, status, row.restaurant_name || null, row.customer_display_name || null, riderLat, riderLng, destLat, destLng);
}

function loadMerchantSnapshot(merchantUserId) {
  const m = db
    .prepare(
      `SELECT mp.user_id, mp.trading_name, mp.contact_email, mp.city, mp.payload, u.email AS account_email
       FROM merchant_profiles mp
       JOIN users u ON u.id = mp.user_id
       WHERE mp.user_id = ? AND u.role = 'merchant'`
    )
    .get(merchantUserId);
  if (!m) return null;
  let pay = {};
  try {
    pay = JSON.parse(m.payload || "{}");
  } catch {
    pay = {};
  }
  const addressLine = pay.addressLine != null ? String(pay.addressLine).trim() : "";
  return {
    userId: m.user_id,
    tradingName: m.trading_name,
    notifyEmail: String(m.contact_email || m.account_email || "").trim().toLowerCase(),
    restaurantAddress: addressLine || (m.city ? String(m.city) : "") || "Update shop address in profile",
    restaurantLat: pay.lat != null && pay.lat !== "" ? Number(pay.lat) : null,
    restaurantLng: pay.lng != null && pay.lng !== "" ? Number(pay.lng) : null,
  };
}

function itemsPreview(items) {
  if (!items?.length) return "";
  return items
    .slice(0, 4)
    .map((it) => `${it.qty ?? 1}× ${it.name || "Item"}`)
    .join("; ");
}

function resolveTrackUrl(code) {
  const base = (process.env.FRONTEND_URL || process.env.API_PUBLIC_URL || "").replace(/\/$/, "");
  return base ? `${base}/track-order.html?code=${encodeURIComponent(code)}` : "";
}

function rowPublic(row, role) {
  const items = JSON.parse(row.items_json || "[]");
  const base = {
    id: row.id,
    trackingCode: row.tracking_code,
    status: row.status,
    restaurantName: row.restaurant_name,
    riderUserId: row.rider_user_id,
    merchantUserId: row.merchant_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
    trackUrl: resolveTrackUrl(row.tracking_code),
  };

  if (role === "merchant" || role === "rider") {
    base.restaurantAddress = row.restaurant_address;
    base.restaurantLat = row.restaurant_lat != null ? Number(row.restaurant_lat) : null;
    base.restaurantLng = row.restaurant_lng != null ? Number(row.restaurant_lng) : null;
    base.customerDisplayName = row.customer_display_name;
  }
  if (role === "merchant") {
    base.deliveryAddress = row.delivery_address;
    base.guestPhone = row.guest_phone;
    base.guestEmail = row.guest_email;
  }
  if (role === "rider") {
    base.deliveryAddress = row.delivery_address;
    base.deliveryLat = row.delivery_lat != null ? Number(row.delivery_lat) : null;
    base.deliveryLng = row.delivery_lng != null ? Number(row.delivery_lng) : null;
    base.guestPhone = row.guest_phone;
    base.customerUserId = row.customer_user_id;
  }
  if (role === "customer" || role === "merchant") {
    base.deliveryLat = row.delivery_lat != null ? Number(row.delivery_lat) : null;
    base.deliveryLng = row.delivery_lng != null ? Number(row.delivery_lng) : null;
  }
  if (role === "customer") {
    base.deliveryAddress = row.delivery_address;
    const eu = db.prepare("SELECT email FROM users WHERE id = ?").get(row.customer_user_id);
    base.customerHint = eu?.email ? "account" : "guest";
  }
  base.riderLiveLat = row.rider_live_lat != null ? Number(row.rider_live_lat) : null;
  base.riderLiveLng = row.rider_live_lng != null ? Number(row.rider_live_lng) : null;

  /** Google Maps Embed (customer track / rider sees customer dot) — no API key */
  base.maps = buildMapsHints(row);

  return base;
}

function buildMapsHints(row) {
  const rl = row.rider_live_lat != null ? Number(row.rider_live_lat) : null;
  const rg = row.rider_live_lng != null ? Number(row.rider_live_lng) : null;
  const dl = row.delivery_lat != null ? Number(row.delivery_lat) : null;
  const dg = row.delivery_lng != null ? Number(row.delivery_lng) : null;
  const sl = row.restaurant_lat != null ? Number(row.restaurant_lat) : null;
  const sg = row.restaurant_lng != null ? Number(row.restaurant_lng) : null;

  const out = {};

  const embedRiderOk = rl != null && rg != null && !Number.isNaN(rl) && !Number.isNaN(rg);
  const embedDestOk = dl != null && dg != null && !Number.isNaN(dl) && !Number.isNaN(dg);
  const embedShopOk = sl != null && sg != null && !Number.isNaN(sl) && !Number.isNaN(sg);

  /** Embed without API keys (basic q= lat,lng only). */
  out.riderEmbedUrl = embedRiderOk
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${rl},${rg}`)}&z=15&output=embed`
    : null;
  out.customerDestinationEmbedUrl = embedDestOk
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${dl},${dg}`)}&z=15&output=embed`
    : null;
  out.shopEmbedUrl = embedShopOk
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${sl},${sg}`)}&z=16&output=embed`
    : null;

  /** Fullscreen — turn-by-turn in Google Maps app. */
  out.riderToCustomerDirectionsUrl =
    embedRiderOk && embedDestOk
      ? `https://www.google.com/maps/dir/${rl},${rg}/${dl},${dg}`
      : embedShopOk && embedDestOk
        ? `https://www.google.com/maps/dir/${sl},${sg}/${dl},${dg}`
        : null;

  /** Customer-facing live rider marker (polling updates iframe src in track UI). */
  out.customerRiderEmbedUrl = embedRiderOk
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${rl},${rg}`)}&z=14&output=embed`
    : null;

  return out;
}

function collectRiderEmails() {
  return db
    .prepare(
      `SELECT DISTINCT LOWER(TRIM(u.email)) AS email
       FROM users u
       INNER JOIN rider_profiles rp ON rp.user_id = u.id AND rp.status != 'rejected'
       WHERE u.role = 'rider' AND u.email IS NOT NULL AND LENGTH(TRIM(u.email)) > 5
       LIMIT 40`
    )
    .all()
    .map((r) => r.email)
    .filter(Boolean);
}

function notifyCustomerAcceptedEmail(row) {
  const trackUrl = resolveTrackUrl(row.tracking_code);
  let custEmail =
    row.guest_email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.guest_email).trim()) &&
    String(row.guest_email).trim().toLowerCase();

  if (row.customer_user_id) {
    const u = db.prepare("SELECT email FROM users WHERE id = ?").get(row.customer_user_id);
    custEmail = u?.email ? String(u.email).trim().toLowerCase() : custEmail;
  }
  if (!custEmail) return;
  notifyCustomerOrderAccepted({
    customerEmail: custEmail,
    trackingCode: row.tracking_code,
    tradingName: row.restaurant_name,
    trackUrl,
  }).catch(() => {});
}

router.get("/shops", (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT mp.user_id AS id, mp.trading_name AS name, mp.city, mp.status
         FROM merchant_profiles mp
         JOIN users u ON u.id = mp.user_id
         WHERE u.role = 'merchant'
         ORDER BY mp.trading_name COLLATE NOCASE
         LIMIT 200`
      )
      .all();
    res.json({ ok: true, shops: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Could not load shops." });
  }
});

router.post("/", optionalAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const merchantUserId = String(body.merchantUserId || body.merchant_user_id || "").trim();
    const itemsIn = Array.isArray(body.items) ? body.items : [];

    const deliveryAddress = String(body.deliveryAddress || body.delivery_address || "").trim();

    let customerUserId = null;
    if (req.user?.sub && req.user.role === "customer") {
      customerUserId = req.user.sub;
    }

    let guest_name = customerUserId ? null : String(body.guestName || body.guest_name || "").trim() || null;
    let guest_phone = customerUserId ? String(body.phone || body.guestPhone || "").trim() || null : String(body.guestPhone || body.phone || "").trim() || null;
    let guest_email = customerUserId ? null : String(body.guestEmail || body.guest_email || "").trim().toLowerCase() || null;

    if (!merchantUserId) {
      return res.status(400).json({ ok: false, error: "merchantUserId required." });
    }
    if (!itemsIn.length) {
      return res.status(400).json({ ok: false, error: "items[] required." });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ ok: false, error: "deliveryAddress required." });
    }
    if (!customerUserId && (!guest_name || !guest_phone)) {
      return res.status(400).json({ ok: false, error: "Guest checkout needs guestName and guestPhone; or sign in." });
    }
    if (!customerUserId && guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
      return res.status(400).json({ ok: false, error: "Valid guestEmail for confirmation messages." });
    }

    const shop = loadMerchantSnapshot(merchantUserId);
    if (!shop?.notifyEmail) {
      return res.status(404).json({ ok: false, error: "Merchant shop not found or missing contact email." });
    }

    const items = itemsIn.map((raw) => ({
      qty: Number(raw.qty ?? raw.quantity ?? 1) || 1,
      name: String(raw.name || "Item").slice(0, 120),
      note: raw.note != null ? String(raw.note).slice(0, 200) : undefined,
    }));

    const deliveryLat =
      body.deliveryLat != null && body.deliveryLat !== "" ? Number(body.delivery_lat ?? body.deliveryLat) : null;
    const deliveryLng =
      body.deliveryLng != null && body.deliveryLng !== "" ? Number(body.delivery_lng ?? body.deliveryLng) : null;

    let tracking_code = normalizeCode(body.trackingCode || "");
    if (!tracking_code) tracking_code = genTrackingCode();
    const exists = db.prepare("SELECT id FROM delivery_orders WHERE tracking_code = ?").get(tracking_code);
    if (exists) tracking_code = genTrackingCode();

    const id = nanoid();
    let customer_display_name =
      guest_name ||
      (customerUserId
        ? db.prepare("SELECT full_name FROM users WHERE id = ?").get(customerUserId)?.full_name || "Customer"
        : "Customer");

    const rowToInsert = {
      id,
      tracking_code,
      status: "pending_restaurant",
      customer_user_id: customerUserId,
      guest_name,
      guest_phone,
      guest_email,
      merchant_user_id: merchantUserId,
      rider_user_id: null,
      restaurant_name: shop.tradingName,
      restaurant_address: shop.restaurantAddress,
      restaurant_lat: shop.restaurantLat,
      restaurant_lng: shop.restaurantLng,
      delivery_address: deliveryAddress,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      rider_live_lat: null,
      rider_live_lng: null,
      items_json: JSON.stringify(items),
      totals_json: body.totals ? JSON.stringify(body.totals) : null,
      customer_display_name,
      notes: body.notes != null ? String(body.notes).slice(0, 500) : null,
    };

    db.prepare(
      `INSERT INTO delivery_orders (
        id, tracking_code, status, customer_user_id, guest_name, guest_phone, guest_email, merchant_user_id,
        rider_user_id, restaurant_name, restaurant_address, restaurant_lat, restaurant_lng,
        delivery_address, delivery_lat, delivery_lng, rider_live_lat, rider_live_lng,
        items_json, totals_json, customer_display_name, notes, updated_at
      ) VALUES (
        @id, @tracking_code, @status, @customer_user_id, @guest_name, @guest_phone, @guest_email, @merchant_user_id,
        @rider_user_id, @restaurant_name, @restaurant_address, @restaurant_lat, @restaurant_lng,
        @delivery_address, @delivery_lat, @delivery_lng, @rider_live_lat, @rider_live_lng,
        @items_json, @totals_json, @customer_display_name, @notes, datetime('now')
      )`
    ).run(rowToInsert);

    const row = db.prepare("SELECT * FROM delivery_orders WHERE id = ?").get(id);
    syncOrderTracking(row);

    notifyMerchantNewOrder({
      merchantEmail: shop.notifyEmail,
      tradingName: shop.tradingName,
      trackingCode: tracking_code,
      itemsPreview: itemsPreview(items),
    }).catch(() => {});

    publishOrderEvent(`merchant:${merchantUserId}`, {
      type: "order_new",
      order: rowPublic(row, "merchant"),
    });

    const customerChan = customerUserId ? `customer:${customerUserId}` : null;
    if (customerChan)
      publishOrderEvent(customerChan, { type: "order_placed", order: rowPublic(row, "customer") });

    res.status(201).json({
      ok: true,
      order: rowPublic(row, customerUserId ? "customer" : "customer"),
      message: shop.notifyEmail ? "Restaurant notified." : "",
    });
  } catch (err) {
    if (String(err?.message || "").includes("UNIQUE")) {
      return res.status(409).json({ ok: false, error: "Tracking code clash — retry." });
    }
    console.error(err);
    res.status(500).json({ ok: false, error: "Could not create order." });
  }
});

router.get("/stream/merchant", streamAuthMiddleware, requireRole("merchant"), (req, res) => {
  attachOrderSse(req, res, [`merchant:${req.user.sub}`]);
});

router.get("/stream/rider", streamAuthMiddleware, requireRole("rider"), (req, res) => {
  attachOrderSse(req, res, riderStreamChannels(req.user.sub));
});

router.get("/stream/customer", streamAuthMiddleware, requireRole("customer"), (req, res) => {
  attachOrderSse(req, res, [`customer:${req.user.sub}`]);
});

router.get("/merchant/mine", authMiddleware, requireRole("merchant"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM delivery_orders WHERE merchant_user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100`
    )
    .all(req.user.sub);
  res.json({
    ok: true,
    orders: rows.map((r) => rowPublic(r, "merchant")),
  });
});

router.post("/merchant/:orderId/accept", authMiddleware, requireRole("merchant"), async (req, res) => {
  const merchantId = req.user.sub;
  const orderId = req.params.orderId;

  const info = db
    .prepare(
      `UPDATE delivery_orders SET status = 'accepted', updated_at = datetime('now')
       WHERE id = ? AND merchant_user_id = ? AND status = 'pending_restaurant'`
    )
    .run(orderId, merchantId);

  if (info.changes === 0) {
    return res.status(409).json({ ok: false, error: "Cannot accept — wrong shop or already handled." });
  }

  const row = db.prepare("SELECT * FROM delivery_orders WHERE id = ?").get(orderId);
  syncOrderTracking(row);

  publishOrderEvent(`merchant:${merchantId}`, {
    type: "order_accepted",
    order: rowPublic(row, "merchant"),
  });

  publishOrderEvent("riders", {
    type: "order_into_pool",
    order: sanitizeOrderForRiderBroadcast(rowPublic(row, "rider")),
  });

  if (row.customer_user_id) {
    publishOrderEvent(`customer:${row.customer_user_id}`, {
      type: "order_accepted",
      order: rowPublic(row, "customer"),
    });
  }

  notifyCustomerAcceptedEmail(row);

  const riderEmails = collectRiderEmails();
  if (riderEmails.length && process.env.RIDER_ORDER_EMAILS === "1") {
    notifyRiderPoolEmails(riderEmails, { tradingName: row.restaurant_name, trackingCode: row.tracking_code }).catch(
      () => {}
    );
  }

  res.json({ ok: true, order: rowPublic(row, "merchant") });
});

/** Strip exact address for broadcast to all riders (they see full detail after claim). */
function sanitizeOrderForRiderBroadcast(full) {
  const o = { ...full };
  delete o.deliveryAddress;
  delete o.guestPhone;
  o.deliveryAreaHint = "Claim to see full address";
  return o;
}

router.get("/rider/pool", authMiddleware, requireRole("rider"), (_req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM delivery_orders WHERE status = 'accepted' AND rider_user_id IS NULL ORDER BY datetime(created_at) ASC LIMIT 80`
    )
    .all();
  res.json({ ok: true, orders: rows.map((r) => sanitizeOrderForRiderBroadcast(rowPublic(r, "rider"))) });
});

router.get("/rider/mine", authMiddleware, requireRole("rider"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM delivery_orders WHERE rider_user_id = ? AND status NOT IN ('delivered','cancelled')
       ORDER BY datetime(updated_at) DESC LIMIT 20`
    )
    .all(req.user.sub);
  res.json({ ok: true, orders: rows.map((r) => rowPublic(r, "rider")) });
});

router.post("/rider/:orderId/claim", authMiddleware, requireRole("rider"), (req, res) => {
  const riderId = req.user.sub;
  const orderId = req.params.orderId;

  const info = db
    .prepare(
      `UPDATE delivery_orders SET rider_user_id = ?, status = 'rider_claimed', updated_at = datetime('now')
       WHERE id = ? AND status = 'accepted' AND rider_user_id IS NULL`
    )
    .run(riderId, orderId);

  if (info.changes === 0) {
    return res.status(409).json({ ok: false, error: "Already claimed or not available." });
  }

  const row = db.prepare("SELECT * FROM delivery_orders WHERE id = ?").get(orderId);
  syncOrderTracking(row);

  publishOrderEvent("riders", { type: "order_claimed_by_other", orderId, trackingCode: row.tracking_code });
  publishOrderEvent(`rider:${riderId}`, { type: "order_assigned_to_you", order: rowPublic(row, "rider") });
  publishOrderEvent(`merchant:${row.merchant_user_id}`, {
    type: "rider_assigned",
    order: rowPublic(row, "merchant"),
  });
  if (row.customer_user_id) {
    publishOrderEvent(`customer:${row.customer_user_id}`, {
      type: "rider_assigned",
      order: rowPublic(row, "customer"),
    });
  }

  res.json({ ok: true, order: rowPublic(row, "rider") });
});

router.patch("/rider/:orderId/location", authMiddleware, requireRole("rider"), (req, res) => {
  const riderId = req.user.sub;
  const orderId = req.params.orderId;
  const body = req.body || {};
  const lat = body.lat != null && body.lat !== "" ? Number(body.lat) : null;
  const lng = body.lng != null && body.lng !== "" ? Number(body.lng) : null;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ ok: false, error: "lat and lng required." });
  }

  const row0 = db.prepare("SELECT * FROM delivery_orders WHERE id = ? AND rider_user_id = ?").get(orderId, riderId);
  if (!row0) return res.status(404).json({ ok: false, error: "Not your active delivery." });

  db.prepare(`UPDATE delivery_orders SET rider_live_lat = ?, rider_live_lng = ?, updated_at = datetime('now') WHERE id = ?`).run(
    lat,
    lng,
    orderId
  );
  const row = db.prepare("SELECT * FROM delivery_orders WHERE id = ?").get(orderId);
  syncOrderTracking(row);

  if (row.customer_user_id) {
    publishOrderEvent(`customer:${row.customer_user_id}`, {
      type: "rider_location",
      trackingCode: row.tracking_code,
      lat,
      lng,
    });
  }

  res.json({ ok: true, trackingCode: row.tracking_code });
});

router.post("/rider/:orderId/status", authMiddleware, requireRole("rider"), (req, res) => {
  const riderId = req.user.sub;
  const orderId = req.params.orderId;
  const nextStatus = String((req.body || {}).status || "").trim();

  const allowed = ["picked_up", "delivering", "delivered", "cancelled"];
  if (!allowed.includes(nextStatus)) {
    return res.status(400).json({ ok: false, error: "Invalid status." });
  }

  const row0 = db.prepare("SELECT * FROM delivery_orders WHERE id = ? AND rider_user_id = ?").get(orderId, riderId);
  if (!row0) return res.status(404).json({ ok: false, error: "Not assigned to you." });

  const flowOk =
    (nextStatus === "picked_up" && row0.status === "rider_claimed") ||
    (nextStatus === "delivering" && ["rider_claimed", "picked_up"].includes(row0.status)) ||
    nextStatus === "delivered" ||
    nextStatus === "cancelled";
  if (!flowOk && nextStatus !== "cancelled") {
    return res.status(409).json({ ok: false, error: "Invalid status transition." });
  }

  db.prepare(`UPDATE delivery_orders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(nextStatus, orderId);
  const row = db.prepare("SELECT * FROM delivery_orders WHERE id = ?").get(orderId);
  syncOrderTracking(row);

  const payload = {
    type: "order_status",
    status: row.status,
    order: rowPublic(row, "customer"),
  };

  publishOrderEvent(`merchant:${row.merchant_user_id}`, { type: "order_status", order: rowPublic(row, "merchant") });
  if (row.customer_user_id) {
    publishOrderEvent(`customer:${row.customer_user_id}`, payload);
  }
  publishOrderEvent(`rider:${riderId}`, { type: "order_status_you", order: rowPublic(row, "rider") });

  res.json({ ok: true, order: rowPublic(row, "rider") });
});

router.get("/customer/mine", authMiddleware, requireRole("customer"), (_req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM delivery_orders WHERE customer_user_id = ? ORDER BY datetime(created_at) DESC LIMIT 40`
    )
    .all(req.user.sub);
  res.json({ ok: true, orders: rows.map((r) => rowPublic(r, "customer")) });
});

export default router;
