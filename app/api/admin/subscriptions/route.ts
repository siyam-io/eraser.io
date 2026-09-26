import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { toErrorResponse } from "@/lib/access";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { getStripe } from "@/lib/stripe";
import { isSubscriptionActive } from "@/lib/plans";

export const dynamic = "force-dynamic";

export type AdminSubscriptionRow = {
  userId: string;
  name: string;
  email: string;
  banned: boolean;
  plan: string;
  /** Mirror of the user record — always present. */
  dbStatus: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  /** Live Stripe data when available, otherwise null. */
  stripeStatus: string | null;
  priceLabel: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string | null;
  invoiceUrl: string | null;
};

function priceLabelOf(price: {
  unit_amount?: number | null;
  currency?: string;
  recurring?: { interval?: string } | null;
} | null): string | null {
  if (!price || price.unit_amount == null) return null;
  const amount = (price.unit_amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: (price.currency ?? "usd").toUpperCase(),
  });
  const interval = price.recurring?.interval;
  return interval ? `${amount} / ${interval}` : amount;
}

/**
 * GET — every user who has billing history (Stripe customer or pro plan),
 * enriched with live Stripe subscription state when Stripe is reachable.
 */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const users = await User.find({
      $or: [
        { stripeCustomerId: { $exists: true, $ne: null } },
        { plan: "pro" },
        { subscriptionStatus: { $ne: null } },
      ],
    })
      .select(
        "name email banned plan subscriptionStatus currentPeriodEnd stripeCustomerId stripeSubscriptionId"
      )
      .sort({ updatedAt: -1 })
      .lean();

    // Stripe lookup: customerId -> subscription info
    const stripeInfo = new Map<
      string,
      {
        status: string;
        priceLabel: string | null;
        cancelAtPeriodEnd: boolean;
        subscriptionId: string;
        invoiceUrl: string | null;
        periodEnd: Date | null;
      }
    >();
    let stripeConnected = false;

    try {
      const stripe = getStripe();
      stripeConnected = true;

      const subs = await stripe.subscriptions.list({
        status: "all",
        limit: 100,
        expand: ["data.latest_invoice"],
      });

      for (const sub of subs.data) {
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        // Prefer active subscriptions, otherwise keep the most recent.
        const existing = stripeInfo.get(customerId);
        if (existing && isSubscriptionActive(existing.status)) continue;

        const item = sub.items?.data?.[0];
        const invoice = sub.latest_invoice;
        const invoiceUrl =
          invoice && typeof invoice === "object" && "hosted_invoice_url" in invoice
            ? invoice.hosted_invoice_url ?? null
            : null;
        const rawPeriodEnd =
          (sub as unknown as { current_period_end?: number }).current_period_end ??
          item?.current_period_end;

        stripeInfo.set(customerId, {
          status: sub.status,
          priceLabel: priceLabelOf(item?.price ?? null),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          subscriptionId: sub.id,
          invoiceUrl,
          periodEnd: rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null,
        });
      }
    } catch (error) {
      console.warn(
        "[admin/subscriptions] Stripe unavailable:",
        error instanceof Error ? error.message : error
      );
    }

    const rows: AdminSubscriptionRow[] = users.map((u) => {
      const live = u.stripeCustomerId ? stripeInfo.get(u.stripeCustomerId) : undefined;
      return {
        userId: String(u._id),
        name: u.name,
        email: u.email,
        banned: Boolean(u.banned),
        plan: u.plan ?? "free",
        dbStatus: u.subscriptionStatus ?? null,
        currentPeriodEnd: u.currentPeriodEnd
          ? new Date(u.currentPeriodEnd).toISOString()
          : null,
        stripeCustomerId: u.stripeCustomerId ?? null,
        stripeStatus: live?.status ?? null,
        priceLabel: live?.priceLabel ?? null,
        cancelAtPeriodEnd: live?.cancelAtPeriodEnd ?? false,
        subscriptionId: live?.subscriptionId ?? u.stripeSubscriptionId ?? null,
        invoiceUrl: live?.invoiceUrl ?? null,
      };
    });

    const summary = {
      total: rows.length,
      active: rows.filter((r) => isSubscriptionActive(r.stripeStatus ?? r.dbStatus)).length,
      canceled: rows.filter(
        (r) => r.stripeStatus === "canceled" || r.dbStatus === "canceled"
      ).length,
      pastDue: rows.filter(
        (r) =>
          r.stripeStatus === "past_due" ||
          r.stripeStatus === "unpaid" ||
          r.dbStatus === "past_due" ||
          r.dbStatus === "unpaid"
      ).length,
    };

    return NextResponse.json({ rows, summary, stripeConnected });
  } catch (error) {
    return toErrorResponse(error);
  }
}
