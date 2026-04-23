import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.TRACKER_DB || path.join(__dirname, "..", "tracker.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tcin TEXT NOT NULL UNIQUE,
    title TEXT,
    image_url TEXT,
    msrp REAL,
    last_price REAL,
    last_in_stock INTEGER DEFAULT 0,
    last_checked_at INTEGER,
    max_price REAL,
    quantity INTEGER DEFAULT 1,
    use_max_allowed INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    tcin TEXT NOT NULL,
    kind TEXT NOT NULL,   -- 'check' | 'restock' | 'price_drop' | 'alert_sent' | 'error'
    price REAL,
    in_stock INTEGER,
    message TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS events_item_idx ON events(item_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS events_kind_idx ON events(kind, created_at DESC);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed defaults once.
const seed = db.prepare(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
);
seed.run("poll_interval_seconds", "90");
seed.run("discord_webhook_url", "");
seed.run("alert_cooldown_seconds", "300");

export const stmts = {
  listItems: db.prepare("SELECT * FROM items ORDER BY created_at DESC"),
  getItem: db.prepare("SELECT * FROM items WHERE id = ?"),
  getItemByTcin: db.prepare("SELECT * FROM items WHERE tcin = ?"),
  insertItem: db.prepare(`
    INSERT INTO items (tcin, title, image_url, msrp, max_price, quantity, use_max_allowed)
    VALUES (@tcin, @title, @image_url, @msrp, @max_price, @quantity, @use_max_allowed)
  `),
  updateItem: db.prepare(`
    UPDATE items SET
      max_price = COALESCE(@max_price, max_price),
      quantity = COALESCE(@quantity, quantity),
      use_max_allowed = COALESCE(@use_max_allowed, use_max_allowed),
      enabled = COALESCE(@enabled, enabled)
    WHERE id = @id
  `),
  updateItemSnapshot: db.prepare(`
    UPDATE items SET
      title = COALESCE(@title, title),
      image_url = COALESCE(@image_url, image_url),
      msrp = COALESCE(@msrp, msrp),
      last_price = @last_price,
      last_in_stock = @last_in_stock,
      last_checked_at = @last_checked_at
    WHERE id = @id
  `),
  deleteItem: db.prepare("DELETE FROM items WHERE id = ?"),
  enabledItems: db.prepare("SELECT * FROM items WHERE enabled = 1"),

  insertEvent: db.prepare(`
    INSERT INTO events (item_id, tcin, kind, price, in_stock, message)
    VALUES (@item_id, @tcin, @kind, @price, @in_stock, @message)
  `),
  recentEvents: db.prepare(`
    SELECT * FROM events ORDER BY created_at DESC LIMIT ?
  `),
  recentAlerts: db.prepare(`
    SELECT * FROM events WHERE kind = 'alert_sent' ORDER BY created_at DESC LIMIT ?
  `),
  lastAlertForItem: db.prepare(`
    SELECT created_at FROM events
    WHERE item_id = ? AND kind = 'alert_sent'
    ORDER BY created_at DESC LIMIT 1
  `),

  stats: db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM items) AS watched,
      (SELECT COUNT(*) FROM items WHERE last_in_stock = 1) AS currently_in_stock,
      (SELECT COUNT(*) FROM events WHERE kind = 'check') AS total_checks,
      (SELECT COUNT(*) FROM events WHERE kind = 'check' AND created_at > strftime('%s','now') - 3600) AS checks_last_hour,
      (SELECT COUNT(*) FROM events WHERE kind = 'alert_sent') AS total_alerts,
      (SELECT COUNT(*) FROM events WHERE kind = 'alert_sent' AND created_at > strftime('%s','now') - 86400) AS alerts_last_day,
      (SELECT COUNT(*) FROM events WHERE kind = 'error' AND created_at > strftime('%s','now') - 3600) AS errors_last_hour,
      (SELECT MAX(created_at) FROM events WHERE kind = 'check') AS last_check_at
  `),

  getSetting: db.prepare("SELECT value FROM settings WHERE key = ?"),
  setSetting: db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `),
  allSettings: db.prepare("SELECT key, value FROM settings"),
};

export function getSetting(key, fallback = null) {
  const row = stmts.getSetting.get(key);
  return row?.value ?? fallback;
}

export function setSetting(key, value) {
  stmts.setSetting.run(key, String(value));
}
