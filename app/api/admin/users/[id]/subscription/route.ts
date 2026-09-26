import { NextResponse } from "next/server";
import { requireAdmin, findUserById } from "@/lib/admin";
import { toErrorResponse, HttpError } from "@/lib/access";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { getStripe } from "@/lib/stripe";
import { isSubscriptionActive } from "@/lib/plans";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

type Action = "cancel_at_period_end" | "restore" | "cancel_now";

const ACTIONS: Action[] = ["cancel_at_period_end", "restore", "cancel_now"];

/**
 * POST — admin subscription controls, executed against Stripe and mirrored
 * back onto the user record so the dashboard stays consistent without webhooks.
 */
export async function POST(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectToDatabase();

    const user = await findUserById(id);
    if (!user) throw new HttpError(404, "User not found");
    if (!user.stripeCustomerId) {
      throw new HttpError(400, "This user has never had a Stripe customer");
    }

    const body = await req.json().catch(() => null);
    const action = body?.action as Action;
    if (!action || !ACTIONS.includes(action)) {
      throw new HttpError(400, `action must be one of: ${ACTIONS.join(", ")}`);
    }

    let subscriptionId = user.stripeSubscriptionId;
    if (!subscriptionId) {
      // Fall back to Stripe's own record when the mirror field is missing.
      const list = await getStripe().subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 10,
      });
      subscriptionId = list.data[0]?.id ?? null;
      if (!subscriptionId) throw new HttpError(404, "No subscription found");
    }

    let result: { status?: string; cancelAtPeriodEnd?: boolean; periodEnd?: Date } = {};

    if (action === "cancel_at_period_end" || action === "restore") {
      const updated = await getStripe().subscriptions.update(subscriptionId, {
        cancel_at_period_end: action === "cancel_at_period_end",
      });
      result = {
        status: updated.status,
        cancelAtPeriodEnd: updated.cancel_at_period_end,
        periodEnd: periodEndOf(updated),
      };
    } else {
      const canceled = await getStripe().subscriptions.cancel(subscriptionId);
      result = {
        status: canceled.status,
        cancelAtPeriodEnd: false,
        periodEnd: periodEndOf(canceled),
      };
    }

    const nextStatus = result.status ?? null;
    const active = isSubscriptionActive(nextStatus);

    await User.updateOne(
      { _id: id },
      {
        $set: {
          plan: active ? "pro" : "free",
          subscriptionStatus: nextStatus,
          ...(action === "cancel_now"
            ? { stripeSubscriptionId: null }
            : {}),
          ...(result.periodEnd ? { currentPeriodEnd: result.periodEnd } : {}),
        },
      }
    );

    const refreshed = await findUserById(id);
    return NextResponse.json({ user: refreshed, action });
  } catch (error) {
    if (
      error instanceof Error &&
      /Stripe/i.test(error.message) &&
      !(error instanceof HttpError)
    ) {
      return NextResponse.json(
        { error: `Stripe: ${error.message}` },
        { status: 502 }
      );
    }
    return toErrorResponse(error);
  }
}

function periodEndOf(subscription: {
  current_period_end?: number;
  items?: { data?: Array<{ current_period_end?: number }> };
}): Date | undefined {
  const raw =
    subscription.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end;
  return raw ? new Date(raw * 1000) : undefined;
}
