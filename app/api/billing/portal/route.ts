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

    const email = normalizeEmail(user.email);
    await connectToDatabase();
    const dbUser = await User.findOne({ email });
    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe to Pro first." },
        { status: 400 }
      );
    }

    const origin = new URL(req.url).origin;
    const session = await getStripe().billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${origin}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return toErrorResponse(error);
  }
}
