import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stmts, getSetting, setSetting } from "./db.mjs";
import { fetchProduct, cartDeepLink } from "./target.mjs";
import { startWatcher } from "./watcher.mjs";
import { sendDiscordAlert } from "./alerts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/items", (req, res) => {
  const rows = stmts.listItems.all().map(serializeItem);
  res.json(rows);
});

app.post("/api/items", async (req, res) => {
  const tcin = String(req.body?.tcin || "").trim();
  if (!/^\d{6,10}$/.test(tcin)) {
    return res.status(400).json({ error: "tcin must be 6-10 digits" });
  }
  if (stmts.getItemByTcin.get(tcin)) {
    return res.status(409).json({ error: "already watching that tcin" });
  }

  let snap = { title: null, imageUrl: null, msrp: null };
  try {
    snap = await fetchProduct(tcin);
  } catch (err) {
    // Proceed; the watcher will retry and fill in details.
  }

  const info = stmts.insertItem.run({
    tcin,
    title: snap.title,
    image_url: snap.imageUrl,
    msrp: snap.msrp,
    max_price: req.body?.max_price ?? null,
    quantity: req.body?.quantity ?? 1,
    use_max_allowed: req.body?.use_max_allowed ? 1 : 0,
  });
  res.status(201).json(serializeItem(stmts.getItem.get(info.lastInsertRowid)));
});

app.patch("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!stmts.getItem.get(id)) return res.status(404).json({ error: "not found" });
  stmts.updateItem.run({
    id,
    max_price: req.body?.max_price ?? null,
    quantity: req.body?.quantity ?? null,
    use_max_allowed:
      req.body?.use_max_allowed == null ? null : req.body.use_max_allowed ? 1 : 0,
    enabled: req.body?.enabled == null ? null : req.body.enabled ? 1 : 0,
  });
  res.json(serializeItem(stmts.getItem.get(id)));
});

app.delete("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  stmts.deleteItem.run(id);
  res.status(204).end();
});

app.post("/api/items/:id/test-alert", async (req, res) => {
  const item = stmts.getItem.get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "not found" });
  try {
    const snap = await fetchProduct(item.tcin);
    const result = await sendDiscordAlert(item, snap);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.get("/api/stats", (req, res) => {
  const stats = stmts.stats.get();
  res.json({
    ...stats,
    poll_interval_seconds: Number(getSetting("poll_interval_seconds", "90")),
    recent_alerts: stmts.recentAlerts.all(20),
    recent_events: stmts.recentEvents.all(50),
  });
});

app.get("/api/settings", (req, res) => {
  const rows = stmts.allSettings.all();
  const out = {};
  for (const r of rows) out[r.key] = r.value;
  // Never send the webhook back in plaintext.
  if (out.discord_webhook_url) {
    out.discord_webhook_url_set = true;
    out.discord_webhook_url = "";
  } else {
    out.discord_webhook_url_set = false;
  }
  res.json(out);
});

app.put("/api/settings", (req, res) => {
  const allowed = [
    "poll_interval_seconds",
    "discord_webhook_url",
    "alert_cooldown_seconds",
  ];
  for (const key of allowed) {
    if (req.body?.[key] != null && req.body[key] !== "") {
      setSetting(key, req.body[key]);
    }
  }
  res.json({ ok: true });
});

app.get("/api/cart-link/:id", (req, res) => {
  const item = stmts.getItem.get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "not found" });
  res.json({ url: cartDeepLink(item.tcin, item.quantity || 1) });
});

// Serve the built frontend in production.
if (process.env.NODE_ENV === "production") {
  const staticDir = path.join(__dirname, "..", "web", "dist");
  app.use(express.static(staticDir));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) return res.status(404).end();
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

function serializeItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    tcin: row.tcin,
    title: row.title,
    imageUrl: row.image_url,
    msrp: row.msrp,
    lastPrice: row.last_price,
    lastInStock: !!row.last_in_stock,
    lastCheckedAt: row.last_checked_at,
    maxPrice: row.max_price,
    quantity: row.quantity,
    useMaxAllowed: !!row.use_max_allowed,
    enabled: !!row.enabled,
    cartUrl: cartDeepLink(row.tcin, row.quantity || 1),
    productUrl: `https://www.target.com/p/-/A-${row.tcin}`,
  };
}

app.listen(PORT, () => {
  console.log(`[tracker] api on http://localhost:${PORT}`);
  startWatcher();
});
