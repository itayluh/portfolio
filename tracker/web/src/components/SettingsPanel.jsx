import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function SettingsPanel() {
  const [s, setS] = useState(null);
  const [webhook, setWebhook] = useState("");
  const [interval, setIntervalSec] = useState("");
  const [cooldown, setCooldown] = useState("");
  const [msg, setMsg] = useState(null);

  async function load() {
    const res = await api.settings();
    setS(res);
    setIntervalSec(res.poll_interval_seconds ?? "");
    setCooldown(res.alert_cooldown_seconds ?? "");
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMsg(null);
    const body = {
      poll_interval_seconds: Number(interval) || 90,
      alert_cooldown_seconds: Number(cooldown) || 300,
    };
    if (webhook) body.discord_webhook_url = webhook;
    await api.updateSettings(body);
    setWebhook("");
    setMsg("Saved.");
    load();
  }

  if (!s) return <p className="muted">Loading…</p>;

  return (
    <div className="settings">
      <label>
        <span>Discord webhook URL</span>
        <input
          type="password"
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          placeholder={s.discord_webhook_url_set ? "•••• configured" : "paste Discord webhook"}
        />
        <small>
          {s.discord_webhook_url_set
            ? "A webhook is configured. Paste a new value to replace it."
            : "Needed for mobile push alerts. Create one in any Discord channel."}
        </small>
      </label>
      <label>
        <span>Poll interval (seconds per SKU)</span>
        <input
          type="number"
          min="30"
          value={interval}
          onChange={(e) => setIntervalSec(e.target.value)}
        />
        <small>Minimum 30s. Lower = more likely to be blocked.</small>
      </label>
      <label>
        <span>Alert cooldown (seconds)</span>
        <input
          type="number"
          min="60"
          value={cooldown}
          onChange={(e) => setCooldown(e.target.value)}
        />
        <small>Minimum gap between repeat alerts for the same SKU.</small>
      </label>
      <button onClick={save}>Save settings</button>
      {msg && <span className="muted">{msg}</span>}
    </div>
  );
}
