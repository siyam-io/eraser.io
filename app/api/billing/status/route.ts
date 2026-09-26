import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBillingSnapshot, reconcileThrottled } from "@/lib/billing";
import { toErrorResponse } from "@/lib/access";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let snap = await getBillingSnapshot(user.email);

    // Self-heal: if we don't see Pro but the user has a Stripe customer, check
    // Stripe directly (throttled). Covers missed/undelivered webhooks.
    if (snap.plan.id !== "pro") {
      const synced = await reconcileThrottled(user.email);
      if (synced) snap = synced;
    }

    const unlimited = snap.fileLimit === null;

    return NextResponse.json({
      plan: snap.plan.id,
      planName: snap.plan.name,
      status: snap.status,
      fileCount: snap.fileCount,
      fileLimit: snap.fileLimit,
      canCreateFile: unlimited || snap.fileCount < (snap.fileLimit ?? 0),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
