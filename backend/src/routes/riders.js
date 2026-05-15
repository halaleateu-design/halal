import { Router } from "express";
import { nanoid } from "nanoid";
import db from "../db.js";
import { authMiddleware, verifyToken } from "../auth.js";
import {
  findUserIdByEmail,
  promoteUserRole,
  upsertRiderProfile,
} from "../profiles.js";
import { notifyNewApplication } from "../notify-email.js";

const router = Router();

function resolveUserId(req, emailFromForm) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      return verifyToken(authHeader.slice(7)).sub;
    } catch {
      /* optional auth */
    }
  }
  const email = String(req.body?.email || req.body?.["rider-email"] || emailFromForm || "").trim().toLowerCase();
  if (email) return findUserIdByEmail(email);
  return null;
}

router.post("/apply", (req, res) => {
  try {
    const body = req.body || {};
    const fullName = String(body["rider-name"] || body.fullName || "").trim();
    const phone = String(body["rider-phone"] || body.phone || "").trim();
    const baseCity = String(body["rider-city"] || body.baseCity || "").trim();
    const vehicle = String(body["rider-vehicle"] || body.vehicle || "").trim();
    const notes = String(body["rider-notes"] || body.notes || "").trim();
    const riderEmail = String(body["rider-email"] || body.email || "").trim().toLowerCase();

    if (!fullName || !phone || !baseCity || !vehicle) {
      return res.status(400).json({ ok: false, error: "Name, phone, city, and vehicle are required." });
    }

    const userId = resolveUserId(req, riderEmail);
    const id = nanoid();
    const payload = { notes, ...body };

    db.prepare(
      `INSERT INTO rider_applications (id, user_id, full_name, phone, base_city, vehicle, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, userId, fullName, phone, baseCity, vehicle, JSON.stringify(payload));

    if (userId) {
      promoteUserRole(userId, "rider");
      upsertRiderProfile(userId, {
        fullName,
        phone,
        baseCity,
        vehicle,
        status: "pending",
        notes: notes || null,
        payload: { ...payload, lastApplicationId: id },
      });
    }

    notifyNewApplication("rider", {
      applicationId: id,
      fullName,
      phone,
      baseCity,
      vehicle,
      riderEmail: riderEmail || null,
      profileLinked: Boolean(userId),
    }).catch((e) => console.error("[notify rider]", e));

    return res.status(201).json({
      ok: true,
      message: "You're on the rider waitlist. We'll contact you when dispatch opens in your area.",
      applicationId: id,
      profileLinked: Boolean(userId),
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
  const profile = db.prepare("SELECT * FROM rider_profiles WHERE user_id = ?").get(req.user.sub);
  return res.json({
    ok: true,
    applications: rows,
    profile: profile
      ? {
          fullName: profile.full_name,
          phone: profile.phone,
          baseCity: profile.base_city,
          vehicle: profile.vehicle,
          status: profile.status,
          notes: profile.notes,
          updatedAt: profile.updated_at,
        }
      : null,
  });
});

export default router;
