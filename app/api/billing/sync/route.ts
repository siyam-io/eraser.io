import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBillingSnapshot, syncUserSubscription } from "@/lib/billing";
import { toErrorResponse } from "@/lib/access";

/**
 * Reconciles the signed-in user's plan from Stripe. Called when Checkout
 * returns so the plan updates immediately, even if the webhook is delayed.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = (await syncUserSubscription(user.email)) ?? (await getBillingSnapshot(user.email));
    const unlimited = snapshot.fileLimit === null;

    return NextResponse.json({
      plan: snapshot.plan.id,
      planName: snapshot.plan.name,
      status: snapshot.status,
      fileCount: snapshot.fileCount,
      fileLimit: snapshot.fileLimit,
      canCreateFile: unlimited || snapshot.fileCount < (snapshot.fileLimit ?? 0),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
