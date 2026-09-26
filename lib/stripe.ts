import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Returns a singleton Stripe client. Lazy so that a missing key does not break
 * `next build` — it only fails when a billing route is actually called.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!cached) {
    cached = new Stripe(key);
  }

  return cached;
}
