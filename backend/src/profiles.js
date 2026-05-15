import db from "./db.js";

function parsePayload(row) {
  if (!row) return null;
  const out = { ...row };
  if (typeof out.payload === "string") {
    try {
      out.payload = JSON.parse(out.payload);
    } catch {
      /* keep string */
    }
  }
  return out;
}

export function findUserIdByEmail(email) {
  const clean = String(email || "").trim().toLowerCase();
  if (!clean) return null;
  const row = db.prepare("SELECT id FROM users WHERE email = ?").get(clean);
  return row?.id || null;
}

export function ensureCustomerProfile(userId, { phone, defaultCity, country } = {}) {
  const row = db.prepare("SELECT user_id FROM customer_profiles WHERE user_id = ?").get(userId);
  if (row) {
    db.prepare(
      `UPDATE customer_profiles SET
        phone = COALESCE(?, phone),
        default_city = COALESCE(?, default_city),
        country = COALESCE(?, country),
        updated_at = datetime('now')
       WHERE user_id = ?`
    ).run(phone || null, defaultCity || null, country || null, userId);
    return;
  }
  db.prepare(
    `INSERT INTO customer_profiles (user_id, phone, default_city, country, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  ).run(userId, phone || null, defaultCity || null, country || "PT");
}

export function upsertMerchantProfile(userId, { tradingName, contactEmail, city, category, status, payload }) {
  const existing = db.prepare("SELECT user_id FROM merchant_profiles WHERE user_id = ?").get(userId);
  const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload || {});
  if (existing) {
    db.prepare(
      `UPDATE merchant_profiles SET
        trading_name = ?,
        contact_email = COALESCE(?, contact_email),
        city = COALESCE(?, city),
        category = COALESCE(?, category),
        status = COALESCE(?, status),
        payload = ?,
        updated_at = datetime('now')
       WHERE user_id = ?`
    ).run(
      tradingName,
      contactEmail || null,
      city || null,
      category || null,
      status || null,
      payloadStr,
      userId
    );
    return;
  }
  db.prepare(
    `INSERT INTO merchant_profiles (user_id, trading_name, contact_email, city, category, status, payload, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(userId, tradingName, contactEmail || null, city || null, category || null, status || "pending", payloadStr);
}

export function upsertRiderProfile(userId, { fullName, phone, baseCity, vehicle, status, notes, payload }) {
  const existing = db.prepare("SELECT user_id FROM rider_profiles WHERE user_id = ?").get(userId);
  const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload || {});
  if (existing) {
    db.prepare(
      `UPDATE rider_profiles SET
        full_name = ?,
        phone = ?,
        base_city = ?,
        vehicle = ?,
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        payload = ?,
        updated_at = datetime('now')
       WHERE user_id = ?`
    ).run(fullName, phone, baseCity, vehicle, status || null, notes || null, payloadStr, userId);
    return;
  }
  db.prepare(
    `INSERT INTO rider_profiles (user_id, full_name, phone, base_city, vehicle, status, notes, payload, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(userId, fullName, phone, baseCity, vehicle, status || "pending", notes || null, payloadStr);
}

export function promoteUserRole(userId, role) {
  const order = { customer: 0, rider: 1, merchant: 2, admin: 3 };
  const row = db.prepare("SELECT role FROM users WHERE id = ?").get(userId);
  if (!row) return;
  if ((order[role] ?? 0) > (order[row.role] ?? 0)) {
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
  }
}

export function formatCustomerProfile(row) {
  if (!row) return null;
  return {
    phone: row.phone,
    defaultCity: row.default_city,
    country: row.country,
    updatedAt: row.updated_at,
  };
}

export function formatMerchantProfile(row) {
  const p = parsePayload(row);
  if (!p) return null;
  return {
    tradingName: p.trading_name,
    contactEmail: p.contact_email,
    city: p.city,
    category: p.category,
    status: p.status,
    payload: p.payload,
    updatedAt: p.updated_at,
  };
}

export function formatRiderProfile(row) {
  const p = parsePayload(row);
  if (!p) return null;
  return {
    fullName: p.full_name,
    phone: p.phone,
    baseCity: p.base_city,
    vehicle: p.vehicle,
    status: p.status,
    notes: p.notes,
    payload: p.payload,
    updatedAt: p.updated_at,
  };
}

export function loadProfilesForUser(userId) {
  const customer = db.prepare("SELECT * FROM customer_profiles WHERE user_id = ?").get(userId);
  const merchant = db.prepare("SELECT * FROM merchant_profiles WHERE user_id = ?").get(userId);
  const rider = db.prepare("SELECT * FROM rider_profiles WHERE user_id = ?").get(userId);
  return {
    customer: formatCustomerProfile(customer),
    merchant: formatMerchantProfile(merchant),
    rider: formatRiderProfile(rider),
  };
}
