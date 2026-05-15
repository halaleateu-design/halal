import { Router } from "express";
import { nanoid } from "nanoid";
import db from "../db.js";
import { hashPassword, signToken } from "../auth.js";
import { ensureCustomerProfile } from "../profiles.js";

const router = Router();
const oauthStates = new Map();

function cfg() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.API_PUBLIC_URL || "http://localhost:3001"}/api/v1/auth/google/callback`,
    frontendUrl: (process.env.FRONTEND_URL || "https://fanciful-moxie-6b5bba.netlify.app").replace(/\/$/, ""),
  };
}

function googleEnabled() {
  const { clientId, clientSecret } = cfg();
  return Boolean(clientId && clientSecret);
}

router.get("/google/status", (_req, res) => {
  res.json({ ok: true, google: googleEnabled() });
});

router.get("/google", (req, res) => {
  const { clientId, redirectUri, frontendUrl } = cfg();
  if (!googleEnabled()) {
    return res.redirect(`${frontendUrl}/signin.html?sso_error=google_not_configured`);
  }
  const state = nanoid(24);
  oauthStates.set(state, Date.now());
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/callback", async (req, res) => {
  const { clientId, clientSecret, redirectUri, frontendUrl } = cfg();
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${frontendUrl}/auth-callback.html?error=${encodeURIComponent(String(error))}`);
  }

  const saved = oauthStates.get(state);
  oauthStates.delete(state);
  if (!saved || Date.now() - saved > 10 * 60 * 1000) {
    return res.redirect(`${frontendUrl}/auth-callback.html?error=invalid_state`);
  }

  if (!code || !googleEnabled()) {
    return res.redirect(`${frontendUrl}/auth-callback.html?error=sso_failed`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error("no_access_token");
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    const email = String(profile.email || "").trim().toLowerCase();
    const fullName = String(profile.name || profile.given_name || "GO user").trim();
    const oauthId = String(profile.sub || "");

    if (!email || !profile.email_verified) {
      return res.redirect(`${frontendUrl}/auth-callback.html?error=email_not_verified`);
    }

    let row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!row) {
      const id = nanoid();
      const placeholderHash = await hashPassword(nanoid(32));
      db.prepare(
        `INSERT INTO users (id, email, password_hash, full_name, role, oauth_provider, oauth_id)
         VALUES (?, ?, ?, ?, 'customer', 'google', ?)`
      ).run(id, email, placeholderHash, fullName, oauthId);
      row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      ensureCustomerProfile(id, { country: "PT" });
    } else {
      db.prepare(`UPDATE users SET oauth_provider = 'google', oauth_id = ?, full_name = COALESCE(NULLIF(full_name,''), ?) WHERE id = ?`).run(
        oauthId,
        fullName,
        row.id
      );
    }

    const token = signToken(row);
    return res.redirect(`${frontendUrl}/auth-callback.html?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("Google SSO error:", err);
    return res.redirect(`${frontendUrl}/auth-callback.html?error=sso_failed`);
  }
});

export default router;
