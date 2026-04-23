// Target redsky PDP client.
//
// Uses the same public endpoint that target.com itself calls from the browser
// to render product pages. No authentication; the `key` is a public frontend
// key and can be overridden via the TARGET_API_KEY env var.
//
// Poll responsibly. Hammering this endpoint is what triggers bot mitigations,
// gets IPs blocked, and is the behavior Target's ToS prohibits. Default cadence
// in the watcher is intentionally conservative.

const REDSKY_URL =
  "https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1";

const DEFAULT_KEY =
  process.env.TARGET_API_KEY || "9f36aeafbe60771e321a7cc95a78140772ab3e96";
const DEFAULT_STORE = process.env.TARGET_STORE_ID || "1375";

function randomVisitorId() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

export async function fetchProduct(tcin, { storeId = DEFAULT_STORE } = {}) {
  const params = new URLSearchParams({
    key: DEFAULT_KEY,
    tcin,
    store_id: storeId,
    pricing_store_id: storeId,
    has_pricing_store_id: "true",
    has_financing_options: "true",
    visitor_id: randomVisitorId(),
    has_size_context: "true",
  });

  const res = await fetch(`${REDSKY_URL}?${params}`, {
    headers: {
      accept: "application/json",
      "user-agent":
        "PokemonRestockWatcher/0.1 (+personal use; contact in repo README)",
    },
  });

  if (!res.ok) {
    throw new Error(`redsky ${res.status} for tcin ${tcin}`);
  }
  const body = await res.json();
  return normalize(body, tcin);
}

function normalize(body, tcin) {
  const product = body?.data?.product;
  if (!product) {
    return { tcin, found: false };
  }

  const item = product.item ?? {};
  const desc = item.product_description ?? {};
  const images = item.enrichment?.images ?? {};
  const price = product.price ?? {};
  const fulfillment = product.fulfillment ?? {};
  const shipping = fulfillment.shipping_options ?? {};

  // A product is considered available if shipping says it's in stock, OR it's
  // available in any store. "Out of stock in all store locations" combined
  // with non-IN_STOCK shipping means unavailable.
  const shippingStatus = shipping.availability_status ?? "UNKNOWN";
  const shippingInStock = shippingStatus === "IN_STOCK";
  const storesOut = fulfillment.is_out_of_stock_in_all_store_locations !== false;
  const inStock = shippingInStock || !storesOut;

  return {
    tcin,
    found: true,
    title: desc.title ?? null,
    imageUrl: images.primary_image_url ?? null,
    msrp: price.reg_retail ?? price.current_retail ?? null,
    currentPrice: price.current_retail ?? null,
    formattedPrice: price.formatted_current_price ?? null,
    inStock,
    shippingStatus,
    rawReleaseDate: item.mmbv_content?.release_date ?? null,
    url: `https://www.target.com/p/-/A-${tcin}`,
  };
}

// Build the deep-link we open when an alert fires.
//
// Target does not expose a documented "add SKU to cart by URL" endpoint for
// arbitrary users. The PDP link with quantity pre-selected is the closest
// reliable approximation — it lands on the product page with the quantity
// stepper set, so checkout is one click away. If you confirm a working
// co-cart URL for your account, swap it in here.
export function cartDeepLink(tcin, quantity = 1) {
  const qty = Math.max(1, Math.floor(quantity));
  return `https://www.target.com/p/-/A-${tcin}?preselect=${tcin}&quantity=${qty}`;
}
