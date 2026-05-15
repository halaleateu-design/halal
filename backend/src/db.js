import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", process.env.DATABASE_PATH ? path.dirname(process.env.DATABASE_PATH) : "data");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(__dirname, "..", process.env.DATABASE_PATH)
  : path.join(dataDir, "go.db");

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

  CREATE TABLE IF NOT EXISTS customer_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone TEXT,
    default_city TEXT,
    country TEXT NOT NULL DEFAULT 'PT',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS merchant_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    trading_name TEXT NOT NULL,
    contact_email TEXT,
    city TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewing','approved','rejected')),
    payload TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rider_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    base_city TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','invited','active','rejected')),
    notes TEXT,
    payload TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_merchant_status ON merchant_applications(status);
  CREATE INDEX IF NOT EXISTS idx_rider_status ON rider_applications(status);

  CREATE TABLE IF NOT EXISTS order_tracking (
    id TEXT PRIMARY KEY,
    tracking_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
    status TEXT NOT NULL DEFAULT 'preparing'
      CHECK(status IN ('preparing','rider_assigned','picked_up','delivering','delivered','cancelled')),
    restaurant_label TEXT,
    customer_label TEXT,
    rider_lat REAL,
    rider_lng REAL,
    dest_lat REAL,
    dest_lng REAL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_order_track_code ON order_tracking(tracking_code);

  CREATE TABLE IF NOT EXISTS delivery_orders (
    id TEXT PRIMARY KEY,
    tracking_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
    status TEXT NOT NULL DEFAULT 'pending_restaurant'
      CHECK(status IN (
        'pending_restaurant','accepted','rider_claimed','picked_up','delivering','delivered','cancelled'
      )),
    customer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_phone TEXT,
    guest_email TEXT,
    merchant_user_id TEXT NOT NULL REFERENCES users(id),
    rider_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    restaurant_name TEXT NOT NULL,
    restaurant_address TEXT,
    restaurant_lat REAL,
    restaurant_lng REAL,
    delivery_address TEXT NOT NULL,
    delivery_lat REAL,
    delivery_lng REAL,
    rider_live_lat REAL,
    rider_live_lng REAL,
    items_json TEXT NOT NULL,
    totals_json TEXT,
    customer_display_name TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_delivery_merchant_status ON delivery_orders(merchant_user_id, status);
  CREATE INDEX IF NOT EXISTS idx_delivery_rider ON delivery_orders(rider_user_id);
  CREATE INDEX IF NOT EXISTS idx_delivery_status_pool ON delivery_orders(status);
`);

try {
  db.exec(`ALTER TABLE users ADD COLUMN oauth_provider TEXT`);
} catch {
  /* exists */
}
try {
  db.exec(`ALTER TABLE users ADD COLUMN oauth_id TEXT`);
} catch {
  /* exists */
}

try {
  db.exec(`ALTER TABLE rider_applications ADD COLUMN contact_email TEXT`);
} catch {
  /* exists */
}
try {
  db.exec(`ALTER TABLE rider_applications ADD COLUMN country TEXT`);
} catch {
  /* exists */
}
try {
  db.exec(`ALTER TABLE rider_applications ADD COLUMN postal_code TEXT`);
} catch {
  /* exists */
}
try {
  db.exec(`ALTER TABLE rider_profiles ADD COLUMN contact_email TEXT`);
} catch {
  /* exists */
}
try {
  db.exec(`ALTER TABLE rider_profiles ADD COLUMN country TEXT`);
} catch {
  /* exists */
}
try {
  db.exec(`ALTER TABLE rider_profiles ADD COLUMN postal_code TEXT`);
} catch {
  /* exists */
}

export default db;
