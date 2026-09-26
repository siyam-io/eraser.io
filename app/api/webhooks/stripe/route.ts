import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { isSubscriptionActive } from "@/lib/plans";

export const runtime = "nodejs";

/** Writes the subscription's plan/status onto the matching user record. */
async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const active = isSubscriptionActive(subscription.status);
  const periodEnd = (subscription as unknown as { current_period_end?: number })
    .current_period_end;

  await connectToDatabase();
  await User.findOneAndUpdate(
    { $or: [{ stripeCustomerId: customerId }, { stripeSubscriptionId: subscription.id }] },
    {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      plan: active ? "pro" : "free",
      ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
    }
  );
}

async function handleEvent(event: Stripe.Event) {
  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subId);
        await syncSubscription(subscription);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        await connectToDatabase();
        // Downgrade so limits are enforced immediately while payment is retried.
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: "past_due", plan: "free" }
        );
      }
      break;
    }

    default:
      break;
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (error) {
    console.error("[stripe webhook] handler failed:", error);
    // Return 500 so Stripe retries.
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
