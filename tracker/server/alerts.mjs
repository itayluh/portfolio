import { getSetting } from "./db.mjs";
import { cartDeepLink } from "./target.mjs";

export async function sendDiscordAlert(item, snapshot) {
  const webhook = getSetting("discord_webhook_url", "");
  if (!webhook) return { sent: false, reason: "no_webhook" };

  const qty = item.use_max_allowed ? "max-allowed" : item.quantity ?? 1;
  const link = cartDeepLink(item.tcin, item.quantity || 1);
  const price = snapshot.formattedPrice
    ?? (snapshot.currentPrice != null ? `$${snapshot.currentPrice}` : "?");

  const payload = {
    username: "Restock Watcher",
    embeds: [
      {
        title: snapshot.title || item.title || `TCIN ${item.tcin}`,
        url: link,
        description: `**${price}** — in stock. Your cap: ${item.max_price != null ? `$${item.max_price}` : "none"} · qty ${qty}`,
        thumbnail: snapshot.imageUrl ? { url: snapshot.imageUrl } : undefined,
        fields: [
          { name: "TCIN", value: String(item.tcin), inline: true },
          {
            name: "MSRP",
            value: item.msrp != null ? `$${item.msrp}` : "—",
            inline: true,
          },
          { name: "Open cart", value: `[Go to product](${link})` },
        ],
        color: 0xcc0000,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { sent: res.ok, status: res.status };
}
