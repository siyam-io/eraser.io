export type PlanId = "free" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  /** Maximum number of files the user may own. `null` means unlimited. */
  fileLimit: number | null;
  /** Stripe price ids, read from env at call time so config can change without a rebuild. */
  prices: () => { monthly?: string; yearly?: string };
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    description: "For trying the workspace out.",
    fileLimit: 5,
    prices: () => ({}),
    features: [
      "Up to 5 files",
      "Document editor + whiteboard",
      "Archive & starred files",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For individuals and small teams shipping real work.",
    fileLimit: null,
    prices: () => ({
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    }),
    features: [
      "Unlimited files",
      "Archive, starred & recent views",
      "Priority support",
    ],
  },
};

export const DEFAULT_PLAN: PlanId = "free";

export function getPlan(id: string | null | undefined): Plan {
  return id === "pro" ? PLANS.pro : PLANS[DEFAULT_PLAN];
}

/**
 * A subscription only grants Pro while it is active. Everything else
 * (past_due, canceled, unpaid, incomplete) falls back to the free limits.
 */
export function isSubscriptionActive(status?: string | null): boolean {
  return status === "active" || status === "trialing";
}

/** Effective plan for a user, taking subscription status into account. */
export function effectivePlan(
  planId: string | null | undefined,
  subscriptionStatus?: string | null
): Plan {
  if (planId === "pro" && isSubscriptionActive(subscriptionStatus)) {
    return PLANS.pro;
  }
  return PLANS.free;
}
