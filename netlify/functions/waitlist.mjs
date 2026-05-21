/**
 * Waitlist API on Netlify (works when Render is behind on deploy).
 * Stores signups in Netlify Blobs; optional Brevo sync via env.
 */
import { getStore } from "@netlify/blobs";

const REF_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

function newId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function newRefCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return s;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function siteBase(headers) {
  const fromEnv = process.env.FRONTEND_URL || process.env.URL || "";
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const origin = headers.get("origin") || headers.get("referer") || "";
  try {
    const u = new URL(origin);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

function queuePosition(record, totalSignups) {
  const boost = Math.floor((record.referralCount || 0) / 3) * 300;
  const rank = record.signupRank || totalSignups;
  return Math.max(1, rank - boost);
}

function payload(record, totalSignups, base) {
  const pos = queuePosition(record, totalSignups);
  const refUrl = base
    ? `${base}/waitlist.html?ref=${encodeURIComponent(record.referralCode)}`
    : `/waitlist.html?ref=${encodeURIComponent(record.referralCode)}`;
  return {
    signupId: record.id,
    queuePosition: pos,
    referralCode: record.referralCode,
    referralUrl: refUrl,
    referralCount: record.referralCount || 0,
    referralsUntilBoost: Math.max(0, 3 - ((record.referralCount || 0) % 3 || 0)),
    isFirst100: pos <= 100,
  };
}

async function syncBrevo(signup) {
  const key = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL;
  if (!key || !sender) return;
  const listIds = (process.env.BREVO_LIST_ID || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => n > 0);
  const first = String(signup.fullName || "").trim().split(/\s+/)[0] || "there";
  try {
    const body = {
      email: signup.email,
      updateEnabled: true,
      attributes: {
        FIRSTNAME: first,
        SMS: signup.phone,
        WHATSAPP: signup.phone,
        CITY: signup.city || "Porto",
      },
    };
    if (listIds.length) body.listIds = listIds;
    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const tpl = Number(process.env.BREVO_WELCOME_TEMPLATE_ID || 0);
    if (tpl > 0) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: tpl,
          to: [{ email: signup.email, name: signup.fullName }],
          params: { FIRSTNAME: first, QUEUE_POSITION: String(signup.queuePosition || "") },
        }),
      });
    } else {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: process.env.BREVO_SENDER_NAME || "EatHalal", email: sender },
          to: [{ email: signup.email, name: signup.fullName }],
          subject: "You're on the EatHalal waitlist — launch perks secured",
          htmlContent: `<p>Hi ${first},</p><p>Thanks for joining the EatHalal Porto waitlist. Your spot is secured.</p><p>Launch perks: free first delivery + 1-year discount for the first 100.</p>`,
        }),
      });
    }
  } catch (e) {
    console.error("[waitlist-fn] brevo:", e);
  }
}

export default async (req, context) => {
  if (req.method === "OPTIONS") return json({ ok: true });

  const store = getStore("eh-waitlist");
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/\.netlify\/functions\/waitlist\/?/, "").replace(/^\/api\/v1\/waitlist\/?/, "");

  if (req.method === "GET" && (path === "stats/public" || path === "stats/public/")) {
    const totalRaw = await store.get("meta:total");
    const total = Number(totalRaw || 0);
    return json({ ok: true, totalSignups: total, first100SlotsLeft: Math.max(0, 100 - total) });
  }

  const posMatch = path.match(/^position\/([^/]+)\/?$/);
  if (req.method === "GET" && posMatch) {
    const id = decodeURIComponent(posMatch[1]);
    const raw = await store.get(`signup:${id}`);
    if (!raw) return json({ ok: false, error: "Signup not found." }, 404);
    const record = JSON.parse(raw);
    const total = Number((await store.get("meta:total")) || 0);
    const base = siteBase(req.headers);
    return json({ ok: true, ...payload(record, total, base) });
  }

  if (req.method === "POST" && (!path || path === "/")) {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }

    const fullName = String(body.fullName || body.name || "").trim();
    const email = normalizeEmail(body.email);
    const phone = String(body.phone || body.whatsapp || "").trim();
    const city = String(body.city || "Porto").trim();
    const referredBy = String(body.referredBy || body.ref || "").trim().toUpperCase();

    if (!fullName || fullName.length < 2) {
      return json({ ok: false, error: "Full name is required." }, 400);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Valid email is required." }, 400);
    }
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      return json({ ok: false, error: "WhatsApp or phone number is required." }, 400);
    }

    const existingId = await store.get(`email:${email}`);
    if (existingId) {
      const raw = await store.get(`signup:${existingId}`);
      const record = raw ? JSON.parse(raw) : null;
      const total = Number((await store.get("meta:total")) || 0);
      const base = siteBase(req.headers);
      return json(
        {
          ok: false,
          error: "This email is already on the waitlist.",
          existing: record ? payload(record, total, base) : { signupId: existingId },
        },
        409
      );
    }

    const total = Number((await store.get("meta:total")) || 0) + 1;
    await store.set("meta:total", String(total));

    let referrerId = null;
    if (referredBy) {
      referrerId = await store.get(`ref:${referredBy}`);
      if (referrerId) {
        const refRaw = await store.get(`signup:${referrerId}`);
        if (refRaw) {
          const refRec = JSON.parse(refRaw);
          refRec.referralCount = (refRec.referralCount || 0) + 1;
          await store.set(`signup:${referrerId}`, JSON.stringify(refRec));
        }
      }
    }

    const id = newId();
    let refCode = newRefCode();
    for (let i = 0; i < 6; i++) {
      if (!(await store.get(`ref:${refCode}`))) break;
      refCode = newRefCode();
    }

    const record = {
      id,
      fullName,
      email,
      phone,
      city,
      country: "PT",
      referralCode: refCode,
      referredBy: referrerId,
      referralCount: 0,
      signupRank: total,
      createdAt: new Date().toISOString(),
    };

    await store.set(`signup:${id}`, JSON.stringify(record));
    await store.set(`email:${email}`, id);
    await store.set(`ref:${refCode}`, id);

    const base = siteBase(req.headers);
    const out = payload(record, total, base);
    context.waitUntil(syncBrevo({ ...record, fullName, queuePosition: out.queuePosition }));

    return json({
      ok: true,
      message: "You're on the list. Share your link to move up faster.",
      ...out,
      perks: out.isFirst100
        ? "First 100 on the list: 1-year launch discount + free first delivery (when we go live)."
        : "Join now — launch perks apply while campaign slots last.",
    }, 201);
  }

  return json({ ok: false, error: "Not found." }, 404);
};
