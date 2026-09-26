/**
 * Ops reconciliation: for every user with a Stripe customer id, read their
 * subscriptions from Stripe and write the correct plan/status back to Mongo.
 *
 * Use this to repair accounts affected by missing webhooks.
 *
 * Usage:
 *   node scripts/stripe-reconcile.mjs            # all users
 *   node scripts/stripe-reconcile.mjs <email>    # one user
 */
import fs from "node:fs";
import Stripe from "stripe";
import mongoose from "mongoose";

const content = fs.readFileSync(".env", "utf8");
for (const line of content.split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const ACTIVE = new Set(["active", "trialing"]);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const targetEmail = process.argv[2];

const mask = (email) => (email || "").replace(/^(.{2}).*(@.*)$/, "$1***$2");

await mongoose.connect(process.env.MONGODB_URI);
const users = mongoose.connection.collection("users");

const query = targetEmail ? { email: targetEmail } : { stripeCustomerId: { $exists: true, $ne: null } };
const docs = await users.find(query).toArray();

if (docs.length === 0) {
  console.log("No matching users with a Stripe customer id.");
}

for (const user of docs) {
  const list = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "all",
    limit: 20,
  });

  const activeSub = list.data.find((s) => ACTIVE.has(s.status));
  const chosen = activeSub ?? [...list.data].sort((a, b) => b.created - a.created)[0] ?? null;

  const nextPlan = chosen && ACTIVE.has(chosen.status) ? "pro" : "free";
  const status = chosen ? chosen.status : null;

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        plan: nextPlan,
        subscriptionStatus: status,
        stripeSubscriptionId: chosen ? chosen.id : null,
      },
    }
  );

  console.log(
    `${mask(user.email)}: ${user.plan ?? "(unset)"} -> ${nextPlan} (status=${status ?? "-"}, subs=${list.data.length})`
  );
}

await mongoose.disconnect();
