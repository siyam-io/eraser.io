/**
 * End-to-end verification that a real Stripe test subscription grants Pro.
 *
 * 1. Creates a Stripe test customer + a trialing subscription on the Pro price.
 * 2. Builds a `customer.subscription.created` event and signs it with the same
 *    STRIPE_WEBHOOK_SECRET the app uses.
 * 3. POSTs it to the running app's /api/webhooks/stripe over HTTP.
 * 4. Asserts the matching user's `plan` in MongoDB became "pro".
 *
 * Requires `npm run dev` to be running.
 * Usage: node scripts/stripe-verify.mjs
 */
import fs from "node:fs";
import Stripe from "stripe";
import mongoose from "mongoose";

function loadEnv() {
  const content = fs.readFileSync(".env", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnv();

const secret = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const mongoUri = process.env.MONGODB_URI;
const baseUrl = process.env.VERIFY_BASE_URL || "http://localhost:3000";

const missing = Object.entries({
  STRIPE_SECRET_KEY: secret,
  STRIPE_PRICE_PRO_MONTHLY: priceId,
  STRIPE_WEBHOOK_SECRET: webhookSecret,
  MONGODB_URI: mongoUri,
})
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  process.exit(1);
}

const stripe = new Stripe(secret);
const email = `stripe-verify+${Date.now()}@example.com`;
let customer;
let subscription;

function fail(message) {
  console.error(`\n✗ FAIL: ${message}`);
  process.exitCode = 1;
}

try {
  await mongoose.connect(mongoUri);
  const users = mongoose.connection.collection("users");

  // 1. Stripe customer + user record linked to it (as checkout would do).
  customer = await stripe.customers.create({
    email,
    metadata: { purpose: "stripe-verify" },
  });

  await users.updateOne(
    { email },
    {
      $set: {
        name: "Stripe Verify",
        email,
        plan: "free",
        stripeCustomerId: customer.id,
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  console.log("• seeded test user (plan=free) for", email);

  // 2. Real trialing subscription on the Pro price (trialing counts as active).
  subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    trial_period_days: 7,
  });
  console.log("• created subscription", subscription.id, "status =", subscription.status);

  // 3. Sign and deliver a real event over HTTP.
  const event = {
    id: `evt_verify_${Date.now()}`,
    object: "event",
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "customer.subscription.created",
    data: { object: subscription },
  };
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });

  const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": signature },
    body: payload,
  });
  const body = await res.text();
  console.log(`• webhook response: ${res.status} ${body}`);

  if (!res.ok) {
    fail(`webhook endpoint returned ${res.status}`);
  }

  // 4. Assert the plan was upgraded.
  const doc = await users.findOne({ email });
  console.log("• user after webhook: plan =", doc?.plan, "status =", doc?.subscriptionStatus);

  if (doc?.plan === "pro" && doc?.subscriptionStatus === "trialing") {
    console.log("\n✓ PASS: test subscription granted Pro (signature verified end-to-end).");
  } else {
    fail(`expected plan=pro/trialing, got plan=${doc?.plan}/status=${doc?.subscriptionStatus}`);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  // Cleanup so repeated runs stay tidy.
  try {
    if (subscription) await stripe.subscriptions.cancel(subscription.id);
    if (customer) await stripe.customers.del(customer.id);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.collection("users").deleteOne({ email });
      await mongoose.disconnect();
    }
  } catch {
    // best-effort cleanup
  }
}
