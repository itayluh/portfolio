import { useState } from "react";
import { api } from "../api.js";

export default function WatchlistTable({ items, onChange }) {
  if (items.length === 0) {
    return <p className="muted">Nothing watched yet. Add a TCIN above.</p>;
  }
  return (
    <div className="watchlist">
      {items.map((item) => (
        <Row key={item.id} item={item} onChange={onChange} />
      ))}
    </div>
  );
}

function Row({ item, onChange }) {
  const [maxPrice, setMaxPrice] = useState(item.maxPrice ?? "");
  const [quantity, setQuantity] = useState(item.quantity ?? 1);
  const [useMax, setUseMax] = useState(item.useMaxAllowed);
  const [saving, setSaving] = useState(false);

  const dirty =
    (item.maxPrice ?? "") !== (maxPrice === "" ? "" : Number(maxPrice)) ||
    (item.quantity ?? 1) !== Number(quantity) ||
    item.useMaxAllowed !== useMax;

  async function save() {
    setSaving(true);
    try {
      await api.updateItem(item.id, {
        max_price: maxPrice === "" ? null : Number(maxPrice),
        quantity: Number(quantity) || 1,
        use_max_allowed: useMax,
      });
      onChange?.();
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled() {
    await api.updateItem(item.id, { enabled: !item.enabled });
    onChange?.();
  }

  async function remove() {
    if (!confirm(`Stop watching ${item.title || item.tcin}?`)) return;
    await api.deleteItem(item.id);
    onChange?.();
  }

  async function testAlert() {
    try {
      await api.testAlert(item.id);
      alert("Test alert sent (check Discord).");
    } catch (e) {
      alert(`Failed: ${e.message}`);
    }
  }

  const stock = item.lastInStock ? "in-stock" : "oos";
  const priceOver =
    item.lastPrice != null &&
    item.maxPrice != null &&
    item.lastPrice > item.maxPrice;

  return (
    <div className={`card ${item.enabled ? "" : "disabled"}`}>
      <div className="img">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title || item.tcin} />
        ) : (
          <div className="no-img">no image yet</div>
        )}
      </div>
      <div className="body">
        <div className="top">
          <a href={item.productUrl} target="_blank" rel="noreferrer">
            <strong>{item.title || `TCIN ${item.tcin}`}</strong>
          </a>
          <span className={`pill ${stock}`}>
            {item.lastInStock ? "In stock" : "Out of stock"}
          </span>
        </div>

        <div className="meta">
          <span>TCIN {item.tcin}</span>
          <span>MSRP {fmtPrice(item.msrp)}</span>
          <span className={priceOver ? "warn" : ""}>
            Last {fmtPrice(item.lastPrice)}
          </span>
          <span className="muted">
            Checked {fmtTime(item.lastCheckedAt)}
          </span>
        </div>

        <div className="controls">
          <label>
            <span>Max $</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>
          <label>
            <span>Qty</span>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              disabled={useMax}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={useMax}
              onChange={(e) => setUseMax(e.target.checked)}
            />
            <span>Max allowed</span>
          </label>
          <button disabled={!dirty || saving} onClick={save}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="actions">
          <a className="button primary" href={item.cartUrl} target="_blank" rel="noreferrer">
            Open in Target
          </a>
          <button onClick={testAlert}>Test alert</button>
          <button onClick={toggleEnabled}>
            {item.enabled ? "Pause" : "Resume"}
          </button>
          <button className="danger" onClick={remove}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function fmtPrice(v) {
  if (v == null) return "—";
  return `$${Number(v).toFixed(2)}`;
}

function fmtTime(sec) {
  if (!sec) return "never";
  const diff = Math.floor(Date.now() / 1000) - sec;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
