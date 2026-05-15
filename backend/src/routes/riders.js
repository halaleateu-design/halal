import { Router } from "express";
import { nanoid } from "nanoid";
import db from "../db.js";
import { authMiddleware, verifyToken } from "../auth.js";

const router = Router();

router.post("/apply", (req, res) => {
  try {
    const body = req.body || {};
    const fullName = String(body["rider-name"] || body.fullName || "").trim();
    const phone = String(body["rider-phone"] || body.phone || "").trim();
    const baseCity = String(body["rider-city"] || body.baseCity || "").trim();
    const vehicle = String(body["rider-vehicle"] || body.vehicle || "").trim();
    const notes = String(body["rider-notes"] || body.notes || "").trim();

    if (!fullName || !phone || !baseCity || !vehicle) {
      return res.status(400).json({ ok: false, error: "Name, phone, city, and vehicle are required." });
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        userId = verifyToken(authHeader.slice(7)).sub;
      } catch {
        /* optional */
      }
    }

    const id = nanoid();
    const payload = { notes, ...body };

    db.prepare(
      `INSERT INTO rider_applications (id, user_id, full_name, phone, base_city, vehicle, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, userId, fullName, phone, baseCity, vehicle, JSON.stringify(payload));

    return res.status(201).json({
      ok: true,
      message: "You're on the rider waitlist. We'll contact you when dispatch opens in your area.",
      applicationId: id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Could not save rider application." });
  }
});

router.get("/my", authMiddleware, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, full_name, phone, base_city, vehicle, status, created_at
       FROM rider_applications WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.sub);
  return res.json({ ok: true, applications: rows });
});

export default router;
