import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", process.env.DATABASE_PATH ? path.dirname(process.env.DATABASE_PATH) : "data");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(__dirname, "..", process.env.DATABASE_PATH)
  : path.join(dataDir, "Tayy.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.mkdirSync(process.env.UPLOAD_DIR ? path.resolve(__dirname, "..", process.env.UPLOAD_DIR) : path.join(dataDir, "uploads"), {
  recursive: true,
});

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','merchant','rider','admin')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS merchant_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    trading_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    city TEXT,
    category TEXT,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewing','approved','rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rider_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    base_city TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','invited','active','rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    application_type TEXT NOT NULL CHECK(application_type IN ('merchant','rider')),
    field_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    stored_path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_merchant_status ON merchant_applications(status);
  CREATE INDEX IF NOT EXISTS idx_rider_status ON rider_applications(status);
`);

export default db;
