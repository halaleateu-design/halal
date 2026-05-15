/**
 * Admin email alerts — Resend API (preferred on Render) or SMTP (e.g. Gmail app password).
 * Never fails the HTTP request if email fails; logs instead.
 */

function notifyToEmails() {
  return (process.env.NOTIFY_TO || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function sendViaResend({ subject, text, html, toRecipients }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = toRecipients?.length ? toRecipients : notifyToEmails();
  if (!key || !from || !to.length) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html: html || undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  return true;
}

async function sendViaSmtp({ subject, text, html, toRecipients }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = toRecipients?.length ? toRecipients : notifyToEmails();
  if (!host || !user || !pass || !to.length) return false;

  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const mailFrom = process.env.NOTIFY_FROM || user;
  await transporter.sendMail({
    from: `"GO" <${mailFrom}>`,
    to: to.join(", "),
    subject,
    text,
    html: html || undefined,
  });
  return true;
}

function adminLink() {
  const base = (process.env.API_PUBLIC_URL || process.env.FRONTEND_URL || "").replace(/\/$/, "");
  return base ? `${base}/admin/#applications` : "";
}

function adminLinkText() {
  return adminLink() || "Set API_PUBLIC_URL or FRONTEND_URL to get a direct admin link in emails.";
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Dashboard check — no secrets / no inbox addresses leaked.
 */
export function getNotifyDiagnostics() {
  const recipientsCount = notifyToEmails().length;
  const resendReady = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
  const smtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  let hint =
    recipientsCount === 0
      ? "Set NOTIFY_TO on Render (comma-separated inbox emails)."
      : !resendReady && !smtpReady
        ? "Add Resend OR SMTP env vars — see backend/.env.example"
        : "Alerts should send on merchant/rider apply — check spam folder too.";

  return {
    alertsReady: recipientsCount > 0 && (resendReady || smtpReady),
    notifyToConfigured: recipientsCount > 0,
    recipientSlots: recipientsCount,
    resendConfigured: resendReady,
    smtpConfigured: smtpReady,
    hint,
  };
}

export async function notifyTestPing() {
  const to = notifyToEmails();
  if (!to.length) {
    console.warn("[notify test] NOTIFY_TO empty");
    return { sent: false, reason: "no_notify_to" };
  }
  const subject = "[GO] Email wiring test";
  const text = "GO backend test message. If you received this, NOTIFY_TO + Resend/SMTP on Render are correct.";
  const html = "<p><strong>GO email test</strong></p><p>If you see this in your inbox, alerts are wired.</p>";
  try {
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      await sendViaResend({ subject, text, html });
      console.info(`[notify test] Resend OK → ${to.join(", ")}`);
      return { sent: true, via: "resend" };
    }
    const smtpOk = await sendViaSmtp({ subject, text, html });
    if (smtpOk) {
      console.info(`[notify test] SMTP OK → ${to.join(", ")}`);
      return { sent: true, via: "smtp" };
    }
    console.warn("[notify test] No RESEND_* or SMTP_* configured");
    return { sent: false, reason: "no_mailer_config" };
  } catch (err) {
    console.error("[notify test] failed:", err?.message || err);
    return { sent: false, reason: "send_error", error: String(err?.message || err) };
  }
}

/**
 * @param {"merchant"|"rider"} type
 * @param {object} summary
 */
export async function notifyNewApplication(type, summary) {
  const to = notifyToEmails();
  if (!to.length) {
    console.warn("[notify] NOTIFY_TO is empty — set it on Render to receive emails.");
    return { sent: false, reason: "no_notify_to" };
  }

  const id = summary.applicationId || "—";
  let subject;
  let text;
  let html;

  if (type === "merchant") {
    subject = `[GO] New merchant · ${summary.tradingName}`;
    text = [
      `New merchant application`,
      ``,
      `ID: ${id}`,
      `Trading name: ${summary.tradingName}`,
      `Contact email: ${summary.contactEmail}`,
      `City: ${summary.city || "—"}`,
      `Category: ${summary.category || "—"}`,
      `Linked to GO account: ${summary.profileLinked ? "yes" : "no"}`,
      ``,
      `Admin inbox: ${adminLinkText()}`,
    ].join("\n");
    const rawLink = adminLink();
    html = `<p><strong>New merchant application</strong></p>
<ul>
<li><b>ID</b> ${escapeHtml(id)}</li>
<li><b>Trading name</b> ${escapeHtml(summary.tradingName)}</li>
<li><b>Email</b> ${escapeHtml(summary.contactEmail)}</li>
<li><b>City</b> ${escapeHtml(summary.city || "—")}</li>
<li><b>Category</b> ${escapeHtml(summary.category || "—")}</li>
<li><b>Linked account</b> ${summary.profileLinked ? "yes" : "no"}</li>
</ul>
${rawLink ? `<p><a href="${escapeHtml(rawLink)}">Open admin inbox</a></p>` : `<p>${escapeHtml(adminLinkText())}</p>`}`;
  } else {
    subject = `[GO] New rider · ${summary.fullName}`;
    text = [
      `New rider waitlist signup`,
      ``,
      `ID: ${id}`,
      `Name: ${summary.fullName}`,
      `Phone: ${summary.phone}`,
      `Country: ${summary.country || "—"}`,
      `Postal / ZIP: ${summary.postalCode || "—"}`,
      `Base city: ${summary.baseCity}`,
      `Vehicle: ${summary.vehicle}`,
      `Email: ${summary.riderEmail || "—"}`,
      `Linked to GO account: ${summary.profileLinked ? "yes" : "no"}`,
      ``,
      `Admin inbox: ${adminLinkText()}`,
    ].join("\n");
    const rawLinkR = adminLink();
    html = `<p><strong>New rider application</strong></p>
<ul>
<li><b>ID</b> ${escapeHtml(id)}</li>
<li><b>Name</b> ${escapeHtml(summary.fullName)}</li>
<li><b>Phone</b> ${escapeHtml(summary.phone)}</li>
<li><b>Country</b> ${escapeHtml(summary.country || "—")}</li>
<li><b>Postal</b> ${escapeHtml(summary.postalCode || "—")}</li>
<li><b>City</b> ${escapeHtml(summary.baseCity)}</li>
<li><b>Vehicle</b> ${escapeHtml(summary.vehicle)}</li>
<li><b>Email</b> ${escapeHtml(summary.riderEmail || "—")}</li>
<li><b>Linked account</b> ${summary.profileLinked ? "yes" : "no"}</li>
</ul>
${rawLinkR ? `<p><a href="${escapeHtml(rawLinkR)}">Open admin inbox</a></p>` : `<p>${escapeHtml(adminLinkText())}</p>`}`;
  }

  try {
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      await sendViaResend({ subject, text, html });
      console.info(`[notify] Resend OK → ${to.join(", ")} (${subject})`);
      return { sent: true, via: "resend" };
    }
    const smtpOk = await sendViaSmtp({ subject, text, html });
    if (smtpOk) {
      console.info(`[notify] SMTP OK → ${to.join(", ")} (${subject})`);
      return { sent: true, via: "smtp" };
    }
    console.warn("[notify] No RESEND_* or SMTP_* configured — email not sent.");
    return { sent: false, reason: "no_mailer_config" };
  } catch (err) {
    console.error("[notify] send failed:", err?.message || err);
    return { sent: false, reason: "send_error", error: String(err?.message || err) };
  }
}

async function dispatchDirectEmail(recipients, { subject, text, html }) {
  const to = recipients.map((s) => String(s || "").trim()).filter(Boolean);
  if (!to.length) {
    console.warn("[notify] No direct recipients");
    return { sent: false, reason: "no_recipients" };
  }
  try {
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      await sendViaResend({ subject, text, html, toRecipients: to });
      console.info(`[notify] Resend OK (direct) (${subject})`);
      return { sent: true, via: "resend" };
    }
    const smtpOk = await sendViaSmtp({ subject, text, html, toRecipients: to });
    if (smtpOk) {
      console.info(`[notify] SMTP OK (direct) (${subject})`);
      return { sent: true, via: "smtp" };
    }
    console.warn("[notify] No mailer configured — direct email skipped.");
    return { sent: false, reason: "no_mailer_config" };
  } catch (err) {
    console.error("[notify] direct send failed:", err?.message || err);
    return { sent: false, reason: "send_error", error: String(err?.message || err) };
  }
}

/**
 * @param {object} o
 */
export async function notifyMerchantNewOrder(o) {
  const merchantEmail = String(o.merchantEmail || "").trim().toLowerCase();
  if (!merchantEmail) return { sent: false, reason: "no_merchant_email" };
  const code = o.trackingCode || "—";
  const subject = `[GO] New order — ${o.tradingName || "your restaurant"}`;
  const text = [
    `You have a new delivery order.`,
    ``,
    `Track / order code: ${code}`,
    o.itemsPreview ? `Items: ${o.itemsPreview}` : ``,
    ``,
    `Open your merchant order inbox on GO to accept.`,
  ]
    .filter(Boolean)
    .join("\n");
  const html = `<p><strong>New order</strong> for ${escapeHtml(o.tradingName || "your store")}</p>
<p><b>Code</b> ${escapeHtml(code)}</p>
${o.itemsPreview ? `<p><b>Items</b> ${escapeHtml(o.itemsPreview)}</p>` : ""}
<p>Open the GO merchant order screen to accept.</p>`;
  return dispatchDirectEmail([merchantEmail], { subject, text, html });
}

/**
 * @param {object} o
 */
export async function notifyCustomerOrderAccepted(o) {
  const customerEmail = String(o.customerEmail || "").trim().toLowerCase();
  if (!customerEmail) return { sent: false, reason: "no_customer_email" };
  const code = o.trackingCode || "—";
  const subject = `[GO] Order accepted — ${code}`;
  const link = o.trackUrl || "";
  const text = [
    `Your order was accepted by ${o.tradingName || "the restaurant"}.`,
    ``,
    `Tracking code: ${code}`,
    link ? `Track delivery: ${link}` : `Use your tracking code on the GO site.`,
  ].join("\n");
  const html = `<p>Your order was <strong>accepted</strong> by ${escapeHtml(o.tradingName || "the restaurant")}.</p>
<p><b>Code</b> ${escapeHtml(code)}</p>
${link ? `<p><a href="${escapeHtml(link)}">Track your delivery</a></p>` : ""}`;
  return dispatchDirectEmail([customerEmail], { subject, text, html });
}

/**
 * Optional supplement to in-app SSE for riders.
 * @param {string[]} riderEmails
 */
export async function notifyRiderPoolEmails(riderEmails, { tradingName, trackingCode }) {
  const emails = [...new Set(riderEmails.map((e) => String(e || "").trim().toLowerCase()).filter(Boolean))].slice(
    0,
    40
  );
  if (!emails.length) return { sent: false, reason: "no_riders" };
  const code = trackingCode || "—";
  const subject = `[GO] Delivery available — ${code}`;
  const text = [
    `A delivery job is available.`,
    ``,
    `Pickup: ${tradingName || "restaurant"}`,
    `Code: ${code}`,
    `Open rider delivery board on GO to claim.`,
  ].join("\n");
  const html = `<p>Open the GO <strong>rider board</strong> to claim.</p><p><b>Code</b> ${escapeHtml(code)} · ${escapeHtml(
    tradingName || "Restaurant"
  )}</p>`;
  return dispatchDirectEmail(emails, { subject, text, html });
}
