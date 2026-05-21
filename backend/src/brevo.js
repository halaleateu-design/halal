/**
 * Brevo (Sendinblue) — waitlist contacts + optional welcome email.
 * Never blocks signup if Brevo fails; logs only.
 */

function brevoHeaders() {
  const key = process.env.BREVO_API_KEY;
  if (!key) return null;
  return {
    "api-key": key,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function listIds() {
  const raw = process.env.BREVO_LIST_ID || "";
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function firstName(fullName) {
  const n = String(fullName || "").trim();
  return n.split(/\s+/)[0] || "there";
}

async function upsertContact({ email, fullName, phone, city, country }) {
  const headers = brevoHeaders();
  if (!headers) return { skipped: true };

  const body = {
    email,
    updateEnabled: true,
    attributes: {
      FIRSTNAME: firstName(fullName),
      LASTNAME: String(fullName || "")
        .trim()
        .split(/\s+/)
        .slice(1)
        .join(" ") || undefined,
      SMS: phone || undefined,
      CITY: city || "Porto",
      COUNTRY: country || "PT",
      WHATSAPP: phone || undefined,
    },
  };
  const ids = listIds();
  if (ids.length) body.listIds = ids;

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 204) return { ok: true };
  const text = await res.text();
  if (res.status === 400 && /already exist/i.test(text)) {
    return { ok: true, duplicate: true };
  }
  throw new Error(`Brevo contact ${res.status}: ${text}`);
}

async function sendWelcomeEmail({ email, fullName, queuePosition, isFirst100, referralUrl }) {
  const headers = brevoHeaders();
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!headers || !senderEmail) return { skipped: true };

  const templateId = Number(process.env.BREVO_WELCOME_TEMPLATE_ID || 0);
  const name = firstName(fullName);
  const perks = isFirst100
    ? "free first delivery and your 1-year launch discount (first 100 on the list)."
    : "early access and launch perks while campaign slots last.";

  if (templateId > 0) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers,
      body: JSON.stringify({
        templateId,
        to: [{ email, name: fullName }],
        params: {
          FIRSTNAME: name,
          QUEUE_POSITION: String(queuePosition ?? ""),
          REFERRAL_URL: referralUrl || "",
          PERKS_LINE: perks,
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Brevo template email ${res.status}: ${text}`);
    }
    return { ok: true, via: "template" };
  }

  const senderName = process.env.BREVO_SENDER_NAME || "EatHalal";
  const site = (process.env.FRONTEND_URL || "https://www.eathalal.pt").replace(/\/$/, "");
  const html = `
    <p>Hi ${name},</p>
    <p>Thanks for joining the EatHalal Porto waitlist. Your spot is secured.</p>
    <p><strong>Launch perks:</strong> ${perks}</p>
    ${queuePosition ? `<p>Your current queue position: <strong>#${queuePosition}</strong>.</p>` : ""}
    ${referralUrl ? `<p>Share with 3 friends to jump ahead: <a href="${referralUrl}">${referralUrl}</a></p>` : ""}
    <p>We will email you again before launch. — <a href="${site}">EatHalal</a></p>
  `.trim();

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers,
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email, name: fullName }],
      subject: "You're on the EatHalal waitlist — launch perks secured",
      htmlContent: html,
      textContent: `Hi ${name},\n\nThanks for joining the EatHalal Porto waitlist.\n\n${perks}\n${
        queuePosition ? `Queue position: #${queuePosition}\n` : ""
      }${referralUrl ? `Referral link: ${referralUrl}\n` : ""}\nEatHalal`,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo email ${res.status}: ${text}`);
  }
  return { ok: true, via: "html" };
}

/** Sync signup to Brevo list and send welcome email (async-safe for routes). */
export async function syncWaitlistToBrevo(signup) {
  if (!process.env.BREVO_API_KEY) return { skipped: true };
  try {
    await upsertContact(signup);
    const mail = await sendWelcomeEmail(signup);
    return { ok: true, mail };
  } catch (err) {
    console.error("[brevo] waitlist sync failed:", err.message || err);
    return { ok: false, error: String(err.message || err) };
  }
}
