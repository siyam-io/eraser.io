import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { normalizeEmail } from "@/lib/validation";
import { toErrorResponse } from "@/lib/access";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const yearly = body?.interval === "yearly";
    const priceId = yearly
      ? process.env.STRIPE_PRICE_PRO_YEARLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY;

    if (!priceId) {
      return NextResponse.json(
        { error: "Pro plan is not configured. Set STRIPE_PRICE_PRO_MONTHLY/YEARLY." },
        { status: 500 }
      );
    }

    const email = normalizeEmail(user.email);
    await connectToDatabase();
    const dbUser = await User.findOne({ email });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripe = getStripe();

    // Reuse the Stripe customer, creating one on first checkout.
    let customerId = dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: dbUser.name ?? undefined,
        metadata: { userId: dbUser._id.toString() },
      });
      customerId = customer.id;
      dbUser.stripeCustomerId = customerId;
      await dbUser.save();
    }

    const origin = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/settings/billing?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      subscription_data: { metadata: { userId: dbUser._id.toString() } },
      metadata: { userId: dbUser._id.toString() },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return toErrorResponse(error);
  }
}
