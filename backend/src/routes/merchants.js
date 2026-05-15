import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import db from "../db.js";
import { authMiddleware, verifyToken } from "../auth.js";
import {
  findUserIdByEmail,
  promoteUserRole,
  upsertMerchantProfile,
} from "../profiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(
  __dirname,
  "..",
  "..",
  process.env.UPLOAD_DIR || "data/uploads"
);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 20 },
});

const router = Router();

function formToPayload(body) {
  const payload = { ...body };
  delete payload.password;
  return payload;
}

function resolveUserId(req, contactEmail) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      return verifyToken(authHeader.slice(7)).sub;
    } catch {
      /* optional auth */
    }
  }
  return findUserIdByEmail(contactEmail);
}

router.post("/apply", upload.any(), (req, res) => {
  try {
    const body = req.body || {};
    const tradingName = String(body["biz-name"] || body.tradingName || "").trim();
    const contactEmail = String(body["biz-email"] || body.email || "").trim().toLowerCase();
    const city = String(body["biz-city"] || body.city || "").trim();

    if (!tradingName || !contactEmail) {
      return res.status(400).json({ ok: false, error: "Trading name and work email are required." });
    }

    const id = nanoid();
    const userId = resolveUserId(req, contactEmail);
    const payload = formToPayload(body);
    const category = String(body["biz-category"] || body["biz-type"] || body.category || "").trim();

    db.prepare(
      `INSERT INTO merchant_applications (id, user_id, trading_name, contact_email, city, category, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, userId, tradingName, contactEmail, city || null, category || null, JSON.stringify(payload));

    if (req.files?.length) {
      const insertUpload = db.prepare(
        `INSERT INTO uploads (id, application_id, application_type, field_name, original_name, stored_path)
         VALUES (?, ?, 'merchant', ?, ?, ?)`
      );
      for (const file of req.files) {
        insertUpload.run(nanoid(), id, file.fieldname, file.originalname, file.filename);
      }
    }

    if (userId) {
      promoteUserRole(userId, "merchant");
      upsertMerchantProfile(userId, {
        tradingName,
        contactEmail,
        city: city || null,
        category: category || null,
        status: "pending",
        payload: { ...payload, lastApplicationId: id },
      });
    }

    return res.status(201).json({
      ok: true,
      message: "Merchant application received. Our team will review within 2–3 business days.",
      applicationId: id,
      profileLinked: Boolean(userId),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Could not save merchant application." });
  }
});

router.get("/my", authMiddleware, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, trading_name, contact_email, city, category, status, created_at
       FROM merchant_applications WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.sub);
  const profile = db.prepare("SELECT * FROM merchant_profiles WHERE user_id = ?").get(req.user.sub);
  return res.json({
    ok: true,
    applications: rows,
    profile: profile
      ? {
          tradingName: profile.trading_name,
          contactEmail: profile.contact_email,
          city: profile.city,
          category: profile.category,
          status: profile.status,
          updatedAt: profile.updated_at,
        }
      : null,
  });
});

export default router;
