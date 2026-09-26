/**
 * Creates the Stripe product + prices for the Pro plan and writes the ids into
 * .env. Safe to re-run: it reuses an existing product/price instead of
 * duplicating them.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... \
 *     node scripts/stripe-setup.mjs
 *
 * Optional:
 *   PRO_MONTHLY_CENTS=900 PRO_YEARLY_CENTS=9000
 *   APP_URL=https://yourapp.com   -> also registers the production webhook endpoint
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Stripe from "stripe";

const envPath = path.join(process.cwd(), ".env");

function readEnvMap(content) {
  const map = new Map();
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

function upsertEnv(updates) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const map = readEnvMap(content);
  const lines = content.length ? content.split(/\r?\n/) : [];
  const written = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || value === "") continue;
    const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
    if (idx >= 0) {
      lines[idx] = `${key}=${value}`;
    } else if (map.has(key)) {
      lines.push(`${key}=${value}`);
    } else {
      lines.push(`${key}=${value}`);
    }
    written.push(key);
  }

  fs.writeFileSync(envPath, lines.join("\n").replace(/\n+$/, "\n"));
  return written;
}

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error("STRIPE_SECRET_KEY is required");
  process.exit(1);
}

const PRODUCT_SLUG = "erasior-pro";
const MONTHLY_CENTS = Number(process.env.PRO_MONTHLY_CENTS || 900);
const YEARLY_CENTS = Number(process.env.PRO_YEARLY_CENTS || 9000);

const stripe = new Stripe(secret);

// --- Product (idempotent via metadata.slug) ---------------------------------
const search = await stripe.products.search({
  query: `metadata['slug']:'${PRODUCT_SLUG}'`,
});
let product = search.data[0];
if (!product) {
  product = await stripe.products.create({
    name: "Erasior Pro",
    description: "Unlimited files, archive & recent views, priority support.",
    metadata: { slug: PRODUCT_SLUG },
  });
  console.log("✓ created product", product.id);
} else {
  console.log("• reusing product", product.id);
}

// --- Prices (idempotent by interval + amount) -------------------------------
async function ensurePrice(interval, amount) {
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const found = prices.data.find(
    (p) => p.recurring?.interval === interval && p.unit_amount === amount && p.currency === "usd"
  );
  if (found) {
    console.log(`• reusing ${interval} price`, found.id, `($${amount / 100})`);
    return found;
  }
  const created = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: amount,
    recurring: { interval },
    metadata: { slug: `${PRODUCT_SLUG}-${interval}` },
  });
  console.log(`✓ created ${interval} price`, created.id, `($${amount / 100})`);
  return created;
}

const monthly = await ensurePrice("month", MONTHLY_CENTS);
const yearly = await ensurePrice("year", YEARLY_CENTS);

// --- Optional production webhook endpoint -----------------------------------
let webhookSecret;
if (process.env.APP_URL) {
  const url = `${process.env.APP_URL.replace(/\/$/, "")}/api/webhooks/stripe`;
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = endpoints.data.find((e) => e.url === url);
  if (existing) {
    console.log("• reusing webhook endpoint", url);
  } else {
    const created = await stripe.webhookEndpoints.create({
      url,
      enabled_events: [
        "checkout.session.completed",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_failed",
      ],
    });
    webhookSecret = created.secret;
    console.log("✓ created webhook endpoint", url);
  }
}

// --- Persist to .env --------------------------------------------------------
const updates = {
  STRIPE_SECRET_KEY: secret,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_PRICE_PRO_MONTHLY: monthly.id,
  STRIPE_PRICE_PRO_YEARLY: yearly.id,
};

// Local dev has no `stripe listen` here, so we generate a signing secret that
// the verify script uses. Replace it with the real endpoint secret in prod.
const existing = readEnvMap(fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "");
if (webhookSecret) {
  updates.STRIPE_WEBHOOK_SECRET = webhookSecret;
} else if (!existing.get("STRIPE_WEBHOOK_SECRET")) {
  updates.STRIPE_WEBHOOK_SECRET = `whsec_local_${crypto.randomBytes(16).toString("hex")}`;
}

const written = upsertEnv(updates);
console.log("\n✓ .env updated:", written.join(", "));
console.log("\nNext: npm run dev, then `npm run stripe:verify`.");
