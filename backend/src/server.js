import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import merchantRoutes from "./routes/merchants.js";
import riderRoutes from "./routes/riders.js";
import adminRoutes from "./routes/admin.js";

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
  res.json({ ok: true, service: "Tayy API", version: "1.0.0" });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
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

app.listen(PORT, () => {
  console.log(`Tayy API + web → http://localhost:${PORT}`);
  console.log(`Static files from: ${staticRoot}`);
});
