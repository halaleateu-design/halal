import { Router } from "express";
import { nanoid, customAlphabet } from "nanoid";
import db from "../db.js";
import { syncWaitlistToBrevo } from "../brevo.js";

const router = Router();
const genRef = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function publicSiteBase() {
  return (process.env.FRONTEND_URL || process.env.API_PUBLIC_URL || "").replace(/\/$/, "");
}

function queuePositionForId(id) {
  const row = db.prepare("SELECT created_at, referral_count FROM waitlist_signups WHERE id = ?").get(id);
  if (!row) return null;
  const rank = db
    .prepare(`SELECT COUNT(*) AS n FROM waitlist_signups WHERE datetime(created_at) <= datetime(?)`)
    .get(row.created_at).n;
  const boost = Math.floor((row.referral_count || 0) / 3) * 300;
  return Math.max(1, rank - boost);
}

function signupPayload(id) {
  const row = db.prepare("SELECT * FROM waitlist_signups WHERE id = ?").get(id);
  if (!row) return null;
  const base = publicSiteBase();
  const pos = queuePositionForId(id);
  const refUrl = base
    ? `${base}/waitlist.html?ref=${encodeURIComponent(row.referral_code)}`
    : `/waitlist.html?ref=${encodeURIComponent(row.referral_code)}`;
  return {
    signupId: id,
    queuePosition: pos,
    referralCode: row.referral_code,
    referralUrl: refUrl,
    referralCount: row.referral_count || 0,
    referralsUntilBoost: Math.max(0, 3 - ((row.referral_count || 0) % 3 || 0)),
    isFirst100: pos <= 100,
  };
}

router.get("/stats/public", (_req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS n FROM waitlist_signups").get().n;
  res.json({ ok: true, totalSignups: total, first100SlotsLeft: Math.max(0, 100 - total) });
});

router.get("/position/:id", (req, res) => {
  const row = db.prepare("SELECT id FROM waitlist_signups WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: "Signup not found." });
  return res.json({ ok: true, ...signupPayload(row.id) });
});

router.post("/", (req, res) => {
  try {
    const body = req.body || {};
    const fullName = String(body.fullName || body.name || "").trim();
    const email = normalizeEmail(body.email);
    const phone = String(body.phone || body.whatsapp || "").trim() || null;
    const city = String(body.city || body.defaultCity || "Porto").trim();
    const country = String(body.country || "PT").trim().toUpperCase().slice(0, 8) || "PT";
    const source = String(body.source || "waitlist.html").trim().slice(0, 80);
    const referredBy = String(body.referredBy || body.ref || "").trim().toUpperCase();

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ ok: false, error: "Full name is required." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      return res.status(400).json({ ok: false, error: "WhatsApp or phone number is required." });
    }
    if (!city || city.length < 2) {
      return res.status(400).json({ ok: false, error: "City is required." });
    }

    const dup = db.prepare("SELECT id FROM waitlist_signups WHERE email = ?").get(email);
    if (dup) {
      return res.status(409).json({
        ok: false,
        error: "This email is already on the waitlist.",
        existing: signupPayload(dup.id),
      });
    }

    let referrerId = null;
    if (referredBy) {
      const refRow = db.prepare("SELECT id FROM waitlist_signups WHERE referral_code = ?").get(referredBy);
      if (refRow) referrerId = refRow.id;
    }

    const id = nanoid();
    let refCode = genRef();
    for (let i = 0; i < 8; i++) {
      const clash = db.prepare("SELECT id FROM waitlist_signups WHERE referral_code = ?").get(refCode);
      if (!clash) break;
      refCode = genRef();
    }

    db.prepare(
      `INSERT INTO waitlist_signups (id, full_name, email, phone, city, country, source, referral_code, referred_by, referral_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    ).run(id, fullName, email, phone, city, country, source, refCode, referrerId);

    if (referrerId) {
      db.prepare(
        `UPDATE waitlist_signups SET referral_count = referral_count + 1 WHERE id = ?`
      ).run(referrerId);
    }

    const payload = signupPayload(id);
    void syncWaitlistToBrevo({
      email,
      fullName,
      phone,
      city,
      country,
      queuePosition: payload.queuePosition,
      isFirst100: payload.isFirst100,
      referralUrl: payload.referralUrl,
    });

    return res.status(201).json({
      ok: true,
      message: "You're on the list. Share your link to move up faster.",
      ...payload,
      perks:
        payload.isFirst100
          ? "First 100 on the list: 1-year launch discount + free first delivery (when we go live)."
          : "Join now — launch perks apply while campaign slots last.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Could not save waitlist signup." });
  }
});

export default router;
