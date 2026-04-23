import { stmts, getSetting } from "./db.mjs";
import { fetchProduct } from "./target.mjs";
import { sendDiscordAlert } from "./alerts.mjs";

let running = false;
let timer = null;

export function startWatcher() {
  if (running) return;
  running = true;
  scheduleNextTick(0);
}

export function stopWatcher() {
  running = false;
  if (timer) clearTimeout(timer);
  timer = null;
}

function scheduleNextTick(delayMs) {
  if (!running) return;
  timer = setTimeout(tick, delayMs);
}

async function tick() {
  const intervalSec = Math.max(30, Number(getSetting("poll_interval_seconds", "90")));
  const cooldownSec = Math.max(60, Number(getSetting("alert_cooldown_seconds", "300")));
  const items = stmts.enabledItems.all();

  // Space requests across the interval so we don't burst-hit redsky.
  const spacing = items.length > 0 ? (intervalSec * 1000) / items.length : 0;

  for (const item of items) {
    await checkOne(item, cooldownSec).catch((err) => {
      stmts.insertEvent.run({
        item_id: item.id,
        tcin: item.tcin,
        kind: "error",
        price: null,
        in_stock: 0,
        message: String(err?.message || err).slice(0, 500),
      });
    });
    if (spacing > 0) await sleep(spacing);
  }

  scheduleNextTick(items.length === 0 ? intervalSec * 1000 : 0);
}

async function checkOne(item, cooldownSec) {
  const snap = await fetchProduct(item.tcin);
  const nowSec = Math.floor(Date.now() / 1000);

  stmts.updateItemSnapshot.run({
    id: item.id,
    title: snap.title,
    image_url: snap.imageUrl,
    msrp: snap.msrp,
    last_price: snap.currentPrice,
    last_in_stock: snap.inStock ? 1 : 0,
    last_checked_at: nowSec,
  });

  stmts.insertEvent.run({
    item_id: item.id,
    tcin: item.tcin,
    kind: "check",
    price: snap.currentPrice,
    in_stock: snap.inStock ? 1 : 0,
    message: null,
  });

  const priceOk =
    item.max_price == null ||
    (snap.currentPrice != null && snap.currentPrice <= item.max_price);

  if (snap.inStock && priceOk) {
    const last = stmts.lastAlertForItem.get(item.id);
    const cooling = last && nowSec - last.created_at < cooldownSec;
    if (!cooling) {
      const result = await sendDiscordAlert(item, snap);
      stmts.insertEvent.run({
        item_id: item.id,
        tcin: item.tcin,
        kind: "alert_sent",
        price: snap.currentPrice,
        in_stock: 1,
        message: result.sent ? "ok" : `skipped:${result.reason || result.status}`,
      });
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
