# Pokemon Restock Watcher (Target)

A personal-use dashboard that watches Target SKUs and alerts you the moment a
tracked item goes in-stock at or below your price cap. On alert it deep-links
you to the product page with your quantity preset, so checkout is one click —
**you** are the one completing the purchase.

## What this is not

- Not an auto-checkout bot. There is no bypassing Target's bot protections,
  no headless-browser automation of the cart/checkout flow, and no anti-detection
  fingerprinting. Those things violate Target's Terms of Use and harm other
  shoppers, so they are out of scope for this tool.
- Not a scraper of non-public data. It reads the same public `redsky` product
  endpoint that target.com itself calls when rendering a PDP.

## What it does

- Stores a watchlist of TCINs with per-item max price, quantity, and an
  optional "use max allowed per order" flag.
- Polls each watched SKU on a configurable interval (default **90s per SKU**,
  spaced out across the interval so requests don't burst).
- Fires a Discord webhook alert when a SKU goes in-stock and the current price
  is at or below your cap, with a cooldown to avoid spam.
- Provides a dashboard showing product image, title, MSRP, last observed price,
  stock status, and recent alerts / error counts.
- Gives you a one-click "Open in Target" button that lands on the PDP with your
  quantity preset.

## Setup

```bash
cd tracker
npm install
npm --prefix web install
npm run build       # builds the frontend
npm start           # serves API + dashboard on http://localhost:3001
```

For development with hot reload:

```bash
npm run dev         # runs server on :3001 and Vite on :5173 with API proxy
```

Open `http://localhost:5173` (dev) or `http://localhost:3001` (prod build).

### Configure the alert webhook

1. In Discord, create a channel and add a **Webhook** integration.
2. Paste the webhook URL into the Settings panel in the dashboard.
3. Click **Test alert** on any watched item to confirm.

## Finding a TCIN

On any Target product page, the TCIN appears in the URL as `A-<TCIN>`
(e.g. `target.com/p/-/A-89542109`) and is also listed on the product details.
Paste that number into the "Add item" form.

## Polling etiquette

The default 90s-per-SKU interval is conservative on purpose.

- Going faster is what triggers rate limits / IP blocks and is what Target's
  bot protections are designed to catch.
- If you're watching many SKUs, the watcher spaces requests across the interval
  so it never bursts — 20 SKUs at 90s means roughly one request every 4.5s.
- Minimum enforced interval is 30s; don't lower it further.

## Layout

```
tracker/
  server/
    index.mjs       # Express API + static file serving
    db.mjs          # SQLite (better-sqlite3) schema + prepared statements
    target.mjs      # redsky client + cart deep-link builder
    watcher.mjs     # Background poll loop
    alerts.mjs      # Discord webhook sender
  web/              # Vite + React dashboard
  tracker.db        # SQLite DB (created on first run; gitignored)
```

## Environment variables

- `PORT` — API server port. Default `3001`.
- `TRACKER_DB` — Absolute path for the SQLite file. Default `./tracker.db`.
- `TARGET_API_KEY` — Override the default redsky public key.
- `TARGET_STORE_ID` — Default store id for pricing. Default `1375`.

## Notes on the "add to cart" deep link

Target does not publish a documented URL that adds a specific TCIN to your cart
in one hop for arbitrary users. The link we generate is the PDP URL with your
quantity preselected, which gets you one click from checkout. If you confirm a
working co-cart URL that behaves the way you want, swap the return value of
`cartDeepLink` in `server/target.mjs`.
