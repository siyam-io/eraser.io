import type Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { File } from "@/models/File";
import { effectivePlan, isSubscriptionActive, type Plan } from "@/lib/plans";
import { HttpError } from "@/lib/access";
import { getStripe } from "@/lib/stripe";

export interface BillingSnapshot {
  plan: Plan;
  status: string | null;
  fileCount: number;
  fileLimit: number | null;
}

/** Resolves the effective plan and current usage for a user. */
export async function getBillingSnapshot(email: string): Promise<BillingSnapshot> {
  await connectToDatabase();

  const [user, fileCount] = await Promise.all([
    User.findOne({ email }).lean(),
    File.countDocuments({ createdBy: email }),
  ]);

  const plan = effectivePlan(user?.plan, user?.subscriptionStatus);

  return {
    plan,
    status: user?.subscriptionStatus ?? null,
    fileCount,
    fileLimit: plan.fileLimit,
  };
}

/**
 * Throws a 402 when the user has hit their plan's file limit. This is the ONLY
 * place the limit is enforced — the UI disable state is just a hint.
 */
export async function assertCanCreateFile(email: string): Promise<Plan> {
  const { plan, fileCount, fileLimit } = await getBillingSnapshot(email);

  if (fileLimit !== null && fileCount >= fileLimit) {
    throw new HttpError(
      402,
      `Your ${plan.name} plan is limited to ${fileLimit} files. Upgrade to Pro for unlimited files.`
    );
  }

  return plan;
}

function periodEndOf(subscription: Stripe.Subscription): Date | undefined {
  const raw =
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    (subscription.items?.data?.[0] as unknown as { current_period_end?: number } | undefined)
      ?.current_period_end;
  return raw ? new Date(raw * 1000) : undefined;
}

/**
 * Reads the user's subscriptions straight from Stripe and writes the result to
 * the user record. Webhooks are the primary source of truth, but they can be
 * missed (not configured, delayed, failed). This reconciliation — called after
 * Checkout returns and lazily from the status endpoint — guarantees the plan is
 * correct regardless.
 *
 * Returns null when the user has no Stripe customer yet.
 */
export async function syncUserSubscription(email: string): Promise<BillingSnapshot | null> {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user?.stripeCustomerId) return null;

  let subscriptions: Stripe.Subscription[];
  try {
    const list = await getStripe().subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 20,
    });
    subscriptions = list.data;
  } catch (error) {
    console.error("[billing] reconciliation failed:", error);
    return null;
  }

  // Prefer an active/trialing subscription, otherwise the most recent one.
  const active = subscriptions.find((s) => isSubscriptionActive(s.status));
  const chosen =
    active ?? [...subscriptions].sort((a, b) => b.created - a.created)[0] ?? null;

  if (!chosen) {
    await User.updateOne(
      { _id: user._id },
      { $set: { plan: "free", subscriptionStatus: null, stripeSubscriptionId: null } }
    );
  } else {
    const periodEnd = periodEndOf(chosen);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          plan: isSubscriptionActive(chosen.status) ? "pro" : "free",
          subscriptionStatus: chosen.status,
          stripeSubscriptionId: chosen.id,
          ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
        },
      }
    );
  }

  return getBillingSnapshot(email);
}

// Throttle lazy reconciliation so a burst of dashboard loads doesn't hammer Stripe.
const lastSyncAt = new Map<string, number>();
const SYNC_INTERVAL_MS = 30_000;

/**
 * Reconciles at most once per interval per user. Returns the fresh snapshot
 * when a sync actually ran, otherwise null.
 */
export async function reconcileThrottled(email: string): Promise<BillingSnapshot | null> {
  const now = Date.now();
  if (now - (lastSyncAt.get(email) ?? 0) < SYNC_INTERVAL_MS) return null;
  lastSyncAt.set(email, now);
  return syncUserSubscription(email);
}
