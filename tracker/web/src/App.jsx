import { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import WatchlistTable from "./components/WatchlistTable.jsx";
import AddItemForm from "./components/AddItemForm.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";

export default function App() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([api.listItems(), api.stats()]);
      setItems(itemsRes);
      setStats(statsRes);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="app">
      <header>
        <h1>Pokemon Restock Watcher</h1>
        <p className="subtitle">
          Target drop notifier. Alerts you the instant a tracked SKU goes in-stock
          at or under your price cap, then deep-links you to the PDP with
          quantity preset. You check out as yourself.
        </p>
      </header>

      {error && <div className="banner error">⚠ {error}</div>}

      <StatsPanel stats={stats} />

      <section>
        <h2>Add item</h2>
        <AddItemForm onAdded={refresh} />
      </section>

      <section>
        <h2>Watching {items.length}</h2>
        <WatchlistTable items={items} onChange={refresh} />
      </section>

      <section>
        <h2>Settings</h2>
        <SettingsPanel />
      </section>

      <footer>
        <p>
          Poll responsibly — default is 90s per SKU. Aggressive polling is what
          triggers bot mitigations and is prohibited by Target's ToS.
        </p>
      </footer>
    </div>
  );
}
