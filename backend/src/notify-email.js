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

async function sendViaResend({ subject, text, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = notifyToEmails();
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

async function sendViaSmtp({ subject, text, html }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = notifyToEmails();
  if (!host || !user || !pass || !to.length) return false;

  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const from = process.env.NOTIFY_FROM || user;
  await transporter.sendMail({
    from: `"GO" <${from}>`,
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
      `City: ${summary.baseCity}`,
      `Vehicle: ${summary.vehicle}`,
      `Account email (if given): ${summary.riderEmail || "—"}`,
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
<li><b>City</b> ${escapeHtml(summary.baseCity)}</li>
<li><b>Vehicle</b> ${escapeHtml(summary.vehicle)}</li>
<li><b>Account email</b> ${escapeHtml(summary.riderEmail || "—")}</li>
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
