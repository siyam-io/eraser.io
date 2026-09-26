import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { toErrorResponse, HttpError } from "@/lib/access";
import { getSettings, updateSettings } from "@/lib/settings";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

/** GET — platform settings plus read-only environment status. */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const [settings, userCount, adminCount] = await Promise.all([
      getSettings(),
      User.countDocuments({}),
      User.countDocuments({ role: "admin" }),
    ]);

    return NextResponse.json({
      settings,
      environment: {
        stripe: Boolean(process.env.STRIPE_SECRET_KEY),
        googleOAuth: Boolean(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ),
        mongodb: Boolean(process.env.MONGODB_URI),
        nodeEnv: process.env.NODE_ENV ?? "development",
        userCount,
        adminCount,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** PUT — update allowSignups / maintenance flags. */
export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Invalid request body");
    }

    const patch: { allowSignups?: boolean; maintenance?: boolean } = {};
    if (body.allowSignups !== undefined) {
      if (typeof body.allowSignups !== "boolean") {
        throw new HttpError(400, "allowSignups must be a boolean");
      }
      patch.allowSignups = body.allowSignups;
    }
    if (body.maintenance !== undefined) {
      if (typeof body.maintenance !== "boolean") {
        throw new HttpError(400, "maintenance must be a boolean");
      }
      patch.maintenance = body.maintenance;
    }

    if (Object.keys(patch).length === 0) {
      throw new HttpError(400, "Nothing to update");
    }

    const settings = await updateSettings(patch);
    return NextResponse.json({ settings });
  } catch (error) {
    return toErrorResponse(error);
  }
}
