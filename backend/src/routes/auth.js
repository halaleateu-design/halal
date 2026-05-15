import { Router } from "express";
import { nanoid } from "nanoid";
import db from "../db.js";
import { authMiddleware, hashPassword, signToken, verifyPassword } from "../auth.js";
import {
  ensureCustomerProfile,
  loadProfilesForUser,
  upsertMerchantProfile,
  upsertRiderProfile,
} from "../profiles.js";

const router = Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function userResponse(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  };
}

function riderCountryFromBody(body) {
  return String(body?.country || body?.riderCountry || body?.["rider-country"] || "").trim().toUpperCase().slice(0, 8);
}

function riderPostalFromBody(body) {
  return String(body?.postalCode || body?.postal_code || body?.["rider-postal"] || "").trim();
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone, role, defaultCity, country } = req.body || {};
    const cleanEmail = normalizeEmail(email);
    const fullName = String(name || "").trim();
    const pass = String(password || "");

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }
    if (pass.length < 8) {
      return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
    }
    if (!fullName) {
      return res.status(400).json({ ok: false, error: "Full name is required." });
    }

    const allowedRoles = ["customer", "merchant", "rider"];
    const userRole = allowedRoles.includes(role) ? role : "customer";
    const phoneVal = String(phone || "").trim() || null;

    if (userRole === "rider") {
      const baseCity = String(req.body.baseCity || req.body.base_city || "").trim();
      const vehicle = String(req.body.vehicle || "").trim();
      const rc = riderCountryFromBody(req.body);
      const postalCode = riderPostalFromBody(req.body);
      if (!baseCity || !vehicle || !phoneVal || rc.length < 2 || postalCode.length < 3) {
        return res.status(400).json({
          ok: false,
          error: "Rider accounts need phone, base city, vehicle, country, and postal code.",
        });
      }
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
    if (existing) {
      return res.status(409).json({ ok: false, error: "An account with this email already exists." });
    }

    const id = nanoid();
    const password_hash = await hashPassword(pass);

    db.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, cleanEmail, password_hash, fullName, phoneVal, userRole);

    ensureCustomerProfile(id, {
      phone: phoneVal,
      defaultCity: userRole === "rider" ? String(req.body.baseCity || req.body.base_city || "").trim() || null : defaultCity || null,
      country:
        userRole === "rider"
          ? riderCountryFromBody(req.body) || "PT"
          : country || "PT",
    });

    if (userRole === "merchant") {
      const tradingName = String(req.body.tradingName || req.body.trading_name || fullName).trim();
      upsertMerchantProfile(id, {
        tradingName,
        contactEmail: cleanEmail,
        city: String(req.body.city || "").trim() || null,
        category: String(req.body.category || "").trim() || null,
        status: "pending",
        payload: { source: "register" },
      });
    }

    if (userRole === "rider") {
      const baseCity = String(req.body.baseCity || req.body.base_city || "").trim();
      const vehicle = String(req.body.vehicle || "").trim();
      const rc = riderCountryFromBody(req.body);
      const postalCode = riderPostalFromBody(req.body);
      upsertRiderProfile(id, {
        fullName,
        phone: phoneVal,
        contactEmail: cleanEmail,
        country: rc,
        postalCode,
        baseCity,
        vehicle,
        status: "pending",
        payload: { source: "register" },
      });
    }

    const user = { id, email: cleanEmail, role: userRole, full_name: fullName };
    const token = signToken(user);
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

    return res.status(201).json({
      ok: true,
      message: "Account created successfully.",
      token,
      user: userResponse(row),
      profiles: loadProfilesForUser(id),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = normalizeEmail(email);
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);
    if (!row) {
      return res.status(401).json({ ok: false, error: "Invalid email or password." });
    }
    if (row.oauth_provider === "google" && !String(password || "").trim()) {
      return res.status(400).json({ ok: false, error: "This account uses Google sign-in. Tap Continue with Google." });
    }
    const valid = await verifyPassword(String(password || ""), row.password_hash);
    if (!valid) {
      return res.status(401).json({ ok: false, error: "Invalid email or password." });
    }

    const token = signToken(row);
    return res.json({
      ok: true,
      token,
      user: userResponse(row),
      profiles: loadProfilesForUser(row.id),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Sign in failed." });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  const row = db.prepare("SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?").get(req.user.sub);
  if (!row) {
    return res.status(404).json({ ok: false, error: "User not found." });
  }
  return res.json({
    ok: true,
    user: userResponse(row),
    profiles: loadProfilesForUser(row.id),
  });
});

export default router;
