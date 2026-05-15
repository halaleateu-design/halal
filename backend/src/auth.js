import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-production";

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ ok: false, error: "Authentication required." });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired session." });
  }
}

/** For SSE: browsers cannot set Authorization on EventSource — allow `?token=` (avoid in shared logs). */
export function streamAuthMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  let token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token && req.query.token) token = String(req.query.token);
  if (!token) {
    return res.status(401).json({ ok: false, error: "Authentication required." });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired session." });
  }
}

export function adminMiddleware(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ ok: false, error: "Forbidden." });
  }
  next();
}

/** Requires authMiddleware earlier in the chain. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: "This action requires a different account type." });
    }
    next();
  };
}
