import { Router } from "express";
import { nanoid, customAlphabet } from "nanoid";
import db from "../db.js";
import { adminMiddleware } from "../auth.js";
import { notifyTestPing } from "../notify-email.js";

const genTrackingCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

const router = Router();
router.use(adminMiddleware);

router.post("/email-test", async (_req, res) => {
  const result = await notifyTestPing();
  if (result.sent) return res.json({ ok: true, message: "Test email sent. Check inbox (and spam).", result });
  return res.status(result.reason === "send_error" ? 502 : 400).json({ ok: false, result });
});

router.get("/stats", (_req, res) => {
  const users = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  const merchants = db.prepare("SELECT COUNT(*) AS c FROM merchant_applications").get().c;
  const riders = db.prepare("SELECT COUNT(*) AS c FROM rider_applications").get().c;
  const tracked = db.prepare("SELECT COUNT(*) AS c FROM order_tracking").get().c;
  res.json({ ok: true, stats: { users, merchantApplications: merchants, riderApplications: riders, trackedOrders: tracked } });
});

router.get("/merchants", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, trading_name, contact_email, city, category, status, created_at
       FROM merchant_applications ORDER BY created_at DESC LIMIT 200`
    )
    .all();
  res.json({ ok: true, applications: rows });
});

router.get("/riders", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, full_name, phone, contact_email, country, postal_code, base_city, vehicle, status, created_at
       FROM rider_applications ORDER BY created_at DESC LIMIT 200`
    )
    .all();
  res.json({ ok: true, applications: rows });
});

router.patch("/merchants/:id/status", (req, res) => {
  const status = req.body?.status;
  if (!["pending", "reviewing", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status." });
  }
  db.prepare("UPDATE merchant_applications SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

router.patch("/riders/:id/status", (req, res) => {
  const status = req.body?.status;
  if (!["pending", "invited", "active", "rejected"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status." });
  }
  db.prepare("UPDATE rider_applications SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

function normalizeTrackingCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 32);
}

router.post("/track", (req, res) => {
  try {
    const body = req.body || {};
    let code = normalizeTrackingCode(body.code);
    if (!code) code = genTrackingCode();
    const id = nanoid();
    const status = ["preparing", "rider_assigned", "picked_up", "delivering", "delivered", "cancelled"].includes(body.status)
      ? body.status
      : "preparing";

    db.prepare(
      `INSERT INTO order_tracking (id, tracking_code, status, restaurant_label, customer_label, dest_lat, dest_lng, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(
      id,
      code,
      status,
      body.restaurantLabel != null ? String(body.restaurantLabel).slice(0, 120) : null,
      body.customerLabel != null ? String(body.customerLabel).slice(0, 120) : null,
      body.destLat != null && body.destLat !== "" ? Number(body.destLat) : null,
      body.destLng != null && body.destLng !== "" ? Number(body.destLng) : null
    );

    return res.status(201).json({
      ok: true,
      trackingCode: code,
      id,
      trackUrlHint: `/track-order.html?code=${encodeURIComponent(code)}`,
    });
  } catch (err) {
    if (String(err?.message || err).includes("UNIQUE"))
      return res.status(409).json({ ok: false, error: "Tracking code already exists — pick another." });
    console.error(err);
    return res.status(500).json({ ok: false, error: "Could not create tracking." });
  }
});

router.patch("/track/:code", (req, res) => {
  try {
    const code = normalizeTrackingCode(req.params.code);
    const row = db.prepare("SELECT * FROM order_tracking WHERE tracking_code = ?").get(code);
    if (!row) return res.status(404).json({ ok: false, error: "Unknown code." });

    const body = req.body || {};
    const status =
      body.status !== undefined &&
      ["preparing", "rider_assigned", "picked_up", "delivering", "delivered", "cancelled"].includes(body.status)
        ? body.status
        : row.status;
    const rider_lat = body.rider_lat !== undefined && body.rider_lat !== "" ? Number(body.rider_lat) : row.rider_lat;
    const rider_lng = body.rider_lng !== undefined && body.rider_lng !== "" ? Number(body.rider_lng) : row.rider_lng;
    const dest_lat = body.dest_lat !== undefined && body.dest_lat !== "" ? Number(body.dest_lat) : row.dest_lat;
    const dest_lng = body.dest_lng !== undefined && body.dest_lng !== "" ? Number(body.dest_lng) : row.dest_lng;

    db.prepare(
      `UPDATE order_tracking SET status = ?, rider_lat = ?, rider_lng = ?, dest_lat = ?, dest_lng = ?, updated_at = datetime('now') WHERE tracking_code = ?`
    ).run(status, rider_lat ?? null, rider_lng ?? null, dest_lat ?? null, dest_lng ?? null, code);

    return res.json({ ok: true, trackingCode: code, status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Could not update tracking." });
  }
});

export default router;
