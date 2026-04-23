export default function StatsPanel({ stats }) {
  if (!stats) return <div className="stats loading">Loading stats…</div>;

  const cards = [
    { label: "Watching", value: stats.watched },
    { label: "In stock now", value: stats.currently_in_stock },
    { label: "Checks (last hr)", value: stats.checks_last_hour },
    { label: "Alerts (24h)", value: stats.alerts_last_day },
    { label: "Errors (last hr)", value: stats.errors_last_hour },
    { label: "Poll interval", value: `${stats.poll_interval_seconds}s` },
  ];

  return (
    <section className="stats">
      <div className="grid">
        {cards.map((c) => (
          <div key={c.label} className="stat">
            <div className="val">{c.value}</div>
            <div className="lab">{c.label}</div>
          </div>
        ))}
      </div>
      {stats.recent_alerts?.length > 0 && (
        <div className="recent">
          <h3>Recent alerts</h3>
          <ul>
            {stats.recent_alerts.slice(0, 10).map((ev) => (
              <li key={ev.id}>
                <span className="tcin">{ev.tcin}</span>
                <span>
                  ${ev.price?.toFixed(2) ?? "?"} — {fmtAgo(ev.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function fmtAgo(sec) {
  const diff = Math.floor(Date.now() / 1000) - sec;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
