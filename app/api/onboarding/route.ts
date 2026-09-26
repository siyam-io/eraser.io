import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensurePersonalTeam } from "@/lib/onboarding";
import { toErrorResponse } from "@/lib/access";

/**
 * Idempotently provisions the signed-in user's personal team. Safe to call
 * repeatedly; used on first dashboard load so new accounts are never stuck.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await ensurePersonalTeam(user.email, user.name);
    return NextResponse.json(team);
  } catch (error) {
    return toErrorResponse(error);
  }
}
