import { useState } from "react";
import { api } from "../api.js";

export default function AddItemForm({ onAdded }) {
  const [tcin, setTcin] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [useMax, setUseMax] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api.addItem({
        tcin: tcin.trim(),
        max_price: maxPrice === "" ? null : Number(maxPrice),
        quantity: Number(quantity) || 1,
        use_max_allowed: useMax,
      });
      setTcin("");
      setMaxPrice("");
      setQuantity(1);
      setUseMax(false);
      onAdded?.();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <label>
        <span>TCIN</span>
        <input
          value={tcin}
          onChange={(e) => setTcin(e.target.value)}
          placeholder="e.g. 89542109"
          required
        />
      </label>
      <label>
        <span>Max price ($)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="MSRP or lower"
        />
      </label>
      <label>
        <span>Quantity</span>
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
        <span>Use max allowed per order</span>
      </label>
      <button type="submit" disabled={busy}>
        {busy ? "Adding…" : "Watch"}
      </button>
      {err && <div className="error inline">{err}</div>}
    </form>
  );
}
