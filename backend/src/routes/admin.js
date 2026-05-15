import { Router } from "express";
import db from "../db.js";
import { adminMiddleware } from "../auth.js";

const router = Router();
router.use(adminMiddleware);

router.get("/stats", (_req, res) => {
  const users = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  const merchants = db.prepare("SELECT COUNT(*) AS c FROM merchant_applications").get().c;
  const riders = db.prepare("SELECT COUNT(*) AS c FROM rider_applications").get().c;
  res.json({ ok: true, stats: { users, merchantApplications: merchants, riderApplications: riders } });
});

router.get("/merchants", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, trading_name, contact_email, city, category, status, created_at
       FROM merchant_applications ORDER BY created_at DESC LIMIT 200`
    )
    .all();
  res.json({ ok: true, applications: rows });
});

router.get("/riders", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, full_name, phone, base_city, vehicle, status, created_at
       FROM rider_applications ORDER BY created_at DESC LIMIT 200`
    )
    .all();
  res.json({ ok: true, applications: rows });
});

router.patch("/merchants/:id/status", (req, res) => {
  const status = req.body?.status;
  if (!["pending", "reviewing", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status." });
  }
  db.prepare("UPDATE merchant_applications SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

router.patch("/riders/:id/status", (req, res) => {
  const status = req.body?.status;
  if (!["pending", "invited", "active", "rejected"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status." });
  }
  db.prepare("UPDATE rider_applications SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
