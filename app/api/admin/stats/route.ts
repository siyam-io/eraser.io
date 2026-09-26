import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { toErrorResponse } from "@/lib/access";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { File } from "@/models/File";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

type MonthBucket = { month: string; count: number };
type RevenueBucket = { month: string; cents: number };

/** UTC month key, matching Mongo's $dateToString default timezone. */
const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

/** Continuous list of the last `count` UTC months, oldest first. */
function lastMonths(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(monthKey(d));
  }
  return out;
}

/** Normalizes a subscription to a monthly amount in cents. */
function monthlyCents(sub: Stripe.Subscription): number {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  if (!price?.unit_amount) return 0;
  const qty = item?.quantity ?? 1;
  const interval = price.recurring?.interval;
  const amount = price.unit_amount * qty;
  return interval === "year" ? Math.round(amount / 12) : amount;
}

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const since = new Date();
    since.setUTCDate(1);
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCMonth(since.getUTCMonth() - 11);

    const [
      totalUsers,
      proUsers,
      totalFiles,
      bannedUsers,
      recentUsers,
      growthAgg,
      upgradeCandidates,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({
        plan: "pro",
        subscriptionStatus: { $in: ["active", "trialing"] },
      }),
      File.countDocuments({}),
      User.countDocuments({ banned: true }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select("name email plan subscriptionStatus createdAt")
        .lean(),
      User.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.find({ subscriptionStatus: { $ne: null } })
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("name email plan subscriptionStatus updatedAt")
        .lean(),
    ]);

    // Continuous 12-month growth series (zero-filled buckets).
    const counts = new Map(growthAgg.map((g) => [g._id, g.count]));
    const growth: MonthBucket[] = lastMonths(12).map((month) => ({
      month,
      count: counts.get(month) ?? 0,
    }));

    // --- Stripe: MRR + paid invoice history ---------------------------------
    let mrrCents: number | null = null;
    let currency = "usd";
    let stripeConnected = false;
    let revenue: RevenueBucket[] = [];

    try {
      const stripe = getStripe();
      stripeConnected = true;

      const [subs, invoices] = await Promise.all([
        stripe.subscriptions.list({ status: "active", limit: 100 }),
        stripe.invoices.list({ status: "paid", limit: 100 }),
      ]);

      mrrCents = subs.data.reduce((sum, s) => sum + monthlyCents(s), 0);
      if (subs.data[0]?.currency) currency = subs.data[0].currency;

      const revenueMap = new Map<string, number>();
      for (const inv of invoices.data) {
        if (!inv.created || inv.total === null) continue;
        const key = monthKey(new Date(inv.created * 1000));
        revenueMap.set(key, (revenueMap.get(key) ?? 0) + inv.total);
      }
      revenue = lastMonths(6).map((month) => ({
        month,
        cents: revenueMap.get(month) ?? 0,
      }));
    } catch (error) {
      // Stripe is optional — the dashboard still works without it.
      console.warn(
        "[admin/stats] Stripe metrics unavailable:",
        error instanceof Error ? error.message : error
      );
    }

    // --- Recent activity feed (signups + subscription changes) --------------
    const activity = [
      ...recentUsers.map((u) => ({
        type: "signup" as const,
        email: u.email,
        name: u.name,
        detail: "created an account",
        at: u.createdAt,
      })),
      ...upgradeCandidates.map((u) => ({
        type: "subscription" as const,
        email: u.email,
        name: u.name,
        detail: `plan is ${u.plan} (${u.subscriptionStatus ?? "no status"})`,
        at: u.updatedAt,
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);

    return NextResponse.json({
      totalUsers,
      proUsers,
      totalFiles,
      bannedUsers,
      mrrCents,
      currency,
      stripeConnected,
      growth,
      revenue,
      activity,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
