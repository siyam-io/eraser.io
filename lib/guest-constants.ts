/**
 * Guest-session primitives that are safe to import from client components.
 *
 * Kept separate from `lib/guest.ts` because that module touches `next/headers`
 * and Mongoose, which cannot be bundled into a client component. Anything a
 * client component needs about guest sessions must live here.
 */

export const GUEST_COOKIE = "guest_session";
export const GUEST_TTL_DAYS = 7;

export const GUEST_PREFIX = "guest:";

/** The synthetic `createdBy` value that stands in for an anonymous user. */
export const guestIdentity = (guestId: string) => `${GUEST_PREFIX}${guestId}`;

/** True for the synthetic identity value, never for a real account email. */
export const isGuestIdentity = (value: string | null | undefined): boolean =>
  Boolean(value && value.startsWith(GUEST_PREFIX));

/** Guest ids are UUID v4 values; anything else is treated as tampering. */
export const GUEST_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
