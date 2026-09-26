import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { HttpError } from "@/lib/access";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";

/**
 * Authoritative admin gate. Every page and route under /admin calls this —
 * the middleware guard is only the first line of defense.
 *
 * Throws:
 *  - 401 when there is no session (or the account is banned)
 *  - 403 when the signed-in user is not an admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }
  if (user.role !== "admin") {
    throw new HttpError(403, "Admin access required");
  }
  return user;
}

/**
 * Lightweight variant for use inside already-guarded handlers that only need
 * the session (avoids the extra database round-trip getCurrentUser does).
 */
export async function getAdminSessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

/** Fetches a user document by id with all public fields (never the password hash). */
export async function findUserById(id: string) {
  await connectToDatabase();
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  return User.findById(id)
    .select(
      "name email image role banned plan stripeCustomerId stripeSubscriptionId subscriptionStatus currentPeriodEnd createdAt updatedAt"
    )
    .lean();
}
