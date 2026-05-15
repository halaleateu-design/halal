import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import db from "./db.js";
import authRoutes from "./routes/auth.js";
import googleAuthRoutes from "./routes/google-auth.js";
import merchantRoutes from "./routes/merchants.js";
import riderRoutes from "./routes/riders.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profiles.js";

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
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 120, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true });

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

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/auth", authLimiter, googleAuthRoutes);
app.use("/api/v1/profile", apiLimiter, profileRoutes);
app.use("/api/v1/merchants", apiLimiter, merchantRoutes);
app.use("/api/v1/riders", apiLimiter, riderRoutes);
app.use("/api/v1/admin", apiLimiter, adminRoutes);

app.use(express.static(staticRoot, { index: "index.html", extensions: ["html"] }));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  const file = path.join(staticRoot, req.path.endsWith("/") ? "index.html" : req.path);
  res.sendFile(file, (err) => {
    if (err) res.sendFile(path.join(staticRoot, "index.html"));
  });
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
