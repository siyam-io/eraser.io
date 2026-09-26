import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

type PriceInfo = {
  amount: number | null;
  currency: string;
  interval: string | null;
} | null;

/**
 * Returns display information for the Pro prices. Degrades gracefully to
 * `null` amounts when Stripe is not configured yet, so the pricing page still
 * renders during local development.
 */
export async function GET() {
  const prices = PLANS.pro.prices();
  const result: { monthly: PriceInfo; yearly: PriceInfo } = { monthly: null, yearly: null };

  if (process.env.STRIPE_SECRET_KEY) {
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const entries = [
      ["monthly", prices.monthly],
      ["yearly", prices.yearly],
    ] as const;

    for (const [key, priceId] of entries) {
      if (!priceId) continue;
      try {
        const price = await stripe.prices.retrieve(priceId);
        result[key] = {
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval ?? null,
        };
      } catch {
        result[key] = null;
      }
    }
  }

  return NextResponse.json(result);
}
