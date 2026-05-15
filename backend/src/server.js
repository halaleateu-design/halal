import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import db from "./db.js";
import authRoutes from "./routes/auth.js";
import googleAuthRoutes from "./routes/google-auth.js";
import merchantRoutes from "./routes/merchants.js";
import riderRoutes from "./routes/riders.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profiles.js";
import trackRoutes from "./routes/track.js";
import orderRoutes from "./routes/orders.js";
import { getNotifyDiagnostics } from "./notify-email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const staticRoot = path.resolve(__dirname, "..", process.env.STATIC_ROOT || "..");

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 120, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true });

function uploadsDir() {
  return path.resolve(__dirname, "..", process.env.UPLOAD_DIR || "data/uploads");
}

app.get("/api/v1/health", (_req, res) => {
  try {
    db.prepare("SELECT 1 AS ok").get();
    res.json({
      ok: true,
      service: "GO API",
      version: "1.1.0",
      database: "connected",
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(503).json({ ok: false, error: "database_unavailable" });
  }
});

app.get("/api/v1/ready", (_req, res) => {
  try {
    db.prepare("SELECT 1 AS ok").get();
    const merchantCount = db.prepare("SELECT COUNT(*) AS n FROM merchant_applications").get().n;
    const riderCount = db.prepare("SELECT COUNT(*) AS n FROM rider_applications").get().n;
    const trackOrders = db.prepare("SELECT COUNT(*) AS n FROM order_tracking").get().n;
    const upDir = uploadsDir();
    let uploadsOk = false;
    try {
      fs.mkdirSync(upDir, { recursive: true });
      fs.accessSync(upDir, fs.constants.W_OK);
      uploadsOk = true;
    } catch {
      uploadsOk = false;
    }
    res.json({
      ok: true,
      database: "connected",
      uploadsWritable: uploadsOk,
      applications: { merchants: merchantCount, riders: riderCount, trackedOrders: trackOrders },
      staticRoot,
    });
  } catch (err) {
    console.error("Ready check failed:", err);
    res.status(503).json({ ok: false, error: "not_ready", detail: String(err?.message || err) });
  }
});

app.get("/api/v1/notify-status", (_req, res) => {
  res.json({ ok: true, email: getNotifyDiagnostics(), time: new Date().toISOString() });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/auth", authLimiter, googleAuthRoutes);
app.use("/api/v1/profile", apiLimiter, profileRoutes);
app.use("/api/v1/merchants", apiLimiter, merchantRoutes);
app.use("/api/v1/riders", apiLimiter, riderRoutes);
app.use("/api/v1/track", apiLimiter, trackRoutes);
app.use("/api/v1/orders", apiLimiter, orderRoutes);

app.use("/api/v1/admin", apiLimiter, adminRoutes);

app.use(express.static(staticRoot, { index: "index.html", extensions: ["html"] }));

function isInsideRoot(rootAbs, fileAbs) {
  const root = path.resolve(rootAbs) + path.sep;
  const file = path.resolve(fileAbs);
  return file === path.resolve(rootAbs) || file.startsWith(root);
}

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  const raw = req.path === "/" ? "" : req.path.replace(/^\/+/, "");
  const candidates = [];
  if (req.path.endsWith("/")) {
    candidates.push(path.join(raw, "index.html"));
  } else {
    candidates.push(raw);
    if (!raw.endsWith(".html")) {
      candidates.push(`${raw}.html`);
      candidates.push(path.join(raw, "index.html"));
    }
  }
  const rootResolved = path.resolve(staticRoot);
  for (const rel of candidates) {
    if (!rel || rel.includes("..")) continue;
    const abs = path.resolve(staticRoot, rel);
    if (!isInsideRoot(staticRoot, abs)) continue;
    try {
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        return res.sendFile(abs);
      }
    } catch {
      /* ignore */
    }
  }
  return res.sendFile(path.join(rootResolved, "index.html"));
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, error: "Not found." });
  }
  res.status(404).send("Not found");
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ ok: false, error: "File too large (max 8 MB)." });
  }
  res.status(500).json({ ok: false, error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`GO API + web → http://localhost:${PORT}`);
  console.log(`Static files from: ${staticRoot}`);
});
