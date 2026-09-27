import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { File } from "@/models/File";
import { HttpError } from "@/lib/access";
import {
  GUEST_COOKIE,
  GUEST_ID_RE,
  GUEST_TTL_DAYS,
  guestIdentity,
  isGuestIdentity,
} from "@/lib/guest-constants";

// Re-exported so existing server-side callers can keep importing from here.
export { GUEST_COOKIE, GUEST_TTL_DAYS, guestIdentity, isGuestIdentity };

/**
 * Guest (anonymous) sessions.
 *
 * A guest is identified by a random id in an httpOnly cookie. That id is
 * turned into a synthetic identity value of the form `guest:<uuid>`, which is
 * what we store in `createdBy` on both Team and File.
 *
 * Using the existing `createdBy` field this way is what keeps this feature
 * small: `requireFileAccess` / `requireTeamAccess` already match on
 * `createdBy`, so guests flow through the same access checks as signed-in
 * users with no new branch, and `assertCanCreateFile` already limits a guest
 * to the free plan's 5 files.
 */
export const newGuestId = () => crypto.randomUUID();

export const guestExpiryDate = () => new Date(Date.now() + GUEST_TTL_DAYS * 86_400_000);

export const guestCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: GUEST_TTL_DAYS * 24 * 60 * 60,
} as const;

/**
 * Reads the guest id from the cookie jar. Returns null when absent or
 * malformed, so a tampered cookie is treated as "no guest" rather than as an
 * arbitrary identity.
 */
export async function readGuestId(): Promise<string | null> {
  try {
    const store = await cookies();
    const raw = store.get(GUEST_COOKIE)?.value;
    return raw && GUEST_ID_RE.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Idempotent: one throwaway team per guest session. */
export async function ensureGuestTeam(guestId: string) {
  const value = guestIdentity(guestId);
  await connectToDatabase();

  const existing = await Team.findOne({ createdBy: value });
  if (existing) return existing;

  return Team.create({ teamName: "Guest Workspace", createdBy: value });
}

export async function clearGuestCookie() {
  (await cookies()).set(GUEST_COOKIE, "", { ...guestCookieOptions, maxAge: 0 });
}

/**
 * Starts a guest session for the current request.
 *
 * Called when someone opens a shared link with neither a session nor a prior
 * guest cookie, so they get a stable Liveblocks userId straight away.
 */
export async function setGuestCookie(guestId: string) {
  (await cookies()).set(GUEST_COOKIE, guestId, guestCookieOptions);
}

/**
 * Moves a browser's anonymous workspaces into a real account.
 *
 * Called from the NextAuth `signIn` callback, immediately after the personal
 * team is provisioned (claimed files need a team to be filed under). Returns
 * how many files were adopted.
 */
export async function claimGuestFiles(
  email: string,
  personalTeamId: string
): Promise<number> {
  const guestId = await readGuestId();
  if (!guestId) return 0;

  const identity = guestIdentity(guestId);
  await connectToDatabase();

  const result = await File.updateMany(
    { createdBy: identity },
    { $set: { createdBy: email, teamId: personalTeamId, expiresAt: null } }
  );

  // The throwaway team has served its purpose; leaving it behind would show up
  // as an empty phantom workspace on any future guest listing.
  await Team.deleteOne({ createdBy: identity });
  await clearGuestCookie();

  return result.modifiedCount ?? 0;
}

/**
 * Per-IP cap on guest workspace creation.
 *
 * In-memory, so it resets on redeploy and is per-instance (the same caveat as
 * the billing reconciliation throttle). It exists to stop trivial abuse, not
 * to be a hard quota — the per-identity free-plan limit is the real ceiling.
 */
const creationsByIp = new Map<string, number[]>();
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export function assertGuestCreationAllowed(ip: string) {
  if (
    process.env.NODE_ENV === "development" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "unknown" ||
    ip === "localhost"
  ) {
    return;
  }

  const now = Date.now();
  const recent = (creationsByIp.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    throw new HttpError(429, "Too many guest workspaces created from this address. Please sign up.");
  }

  recent.push(now);
  creationsByIp.set(ip, recent);
}

/** Best-effort client address from the proxy headers Vercel sets. */
export function clientIpFrom(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
