import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../auth.js";
import { ensureCustomerProfile, loadProfilesForUser } from "../profiles.js";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  const row = db
    .prepare("SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?")
    .get(req.user.sub);
  if (!row) {
    return res.status(404).json({ ok: false, error: "User not found." });
  }

  const merchantApps = db
    .prepare(
      `SELECT id, trading_name, status, created_at FROM merchant_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`
    )
    .all(row.id);
  const riderApps = db
    .prepare(
      `SELECT id, base_city, status, created_at FROM rider_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`
    )
    .all(row.id);

  return res.json({
    ok: true,
    user: {
      id: row.id,
      email: row.email,
      name: row.full_name,
      phone: row.phone,
      role: row.role,
      createdAt: row.created_at,
    },
    profiles: loadProfilesForUser(row.id),
    applications: { merchant: merchantApps, rider: riderApps },
  });
});

router.patch("/", authMiddleware, (req, res) => {
  const { phone, defaultCity, country, name } = req.body || {};
  const userId = req.user.sub;

  if (name && String(name).trim()) {
    db.prepare("UPDATE users SET full_name = ? WHERE id = ?").run(String(name).trim(), userId);
  }
  if (phone !== undefined) {
    db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(String(phone || "").trim() || null, userId);
  }

  ensureCustomerProfile(userId, {
    phone: phone !== undefined ? String(phone || "").trim() || null : undefined,
    defaultCity: defaultCity !== undefined ? String(defaultCity || "").trim() || null : undefined,
    country: country !== undefined ? String(country || "PT").trim() || "PT" : undefined,
  });

  const row = db.prepare("SELECT id, email, full_name, phone, role FROM users WHERE id = ?").get(userId);
  return res.json({
    ok: true,
    message: "Profile updated.",
    user: { id: row.id, email: row.email, name: row.full_name, phone: row.phone, role: row.role },
    profiles: loadProfilesForUser(userId),
  });
});

export default router;
