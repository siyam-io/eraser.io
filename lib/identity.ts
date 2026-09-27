import { getCurrentUser } from "@/lib/auth";
import { guestIdentity, isGuestIdentity, readGuestId } from "@/lib/guest";

/**
 * The identity performing a request: either a signed-in user or a guest.
 *
 * `value` is what every existing access check already takes as its first
 * argument (`createdBy`), which is why signed-in and anonymous users can share
 * one authorization path.
 */
export type Identity = {
  value: string;
  isGuest: boolean;
  name: string;
  image?: string | null;
};

/**
 * Resolves the acting identity for a route handler.
 *
 * A valid session always wins over a guest cookie, so signing in can never be
 * downgraded back to a guest by a leftover cookie. A `guest:`-prefixed email
 * is rejected outright: no real account can have that shape, so treating it as
 * unauthenticated closes off any path where a crafted session could claim
 * another guest's files.
 */
export async function resolveIdentity(): Promise<Identity | null> {
  const user = await getCurrentUser();

  if (user?.email && !isGuestIdentity(user.email)) {
    return {
      value: user.email,
      isGuest: false,
      name: user.name || user.email,
      image: user.image,
    };
  }

  const guestId = await readGuestId();
  if (!guestId) return null;

  return {
    value: guestIdentity(guestId),
    isGuest: true,
    name: "Guest",
    image: null,
  };
}
