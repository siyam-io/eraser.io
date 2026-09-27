import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { File } from "@/models/File";
import { resolveIdentity } from "@/lib/identity";
import {
  GUEST_COOKIE,
  assertGuestCreationAllowed,
  clientIpFrom,
  ensureGuestTeam,
  guestCookieOptions,
  guestExpiryDate,
  guestIdentity,
  newGuestId,
  readGuestId,
} from "@/lib/guest";

/**
 * GET /canvas
 *
 * Instant entry point for free canvas usage without requiring login or registration.
 *
 * 1. If signed in, redirects to the user's latest canvas/file or creates a new one.
 * 2. If unauthenticated, uses an existing guest session or transparently creates
 *    a new guest workspace stamped with an httpOnly session cookie.
 * 3. Immediately redirects to the canvas workspace view with no friction.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const forceNew = url.searchParams.get("new") === "true";
    await connectToDatabase();

    const identity = await resolveIdentity();

    // Authenticated user path
    if (identity && !identity.isGuest) {
      if (!forceNew) {
        const latestFile = await File.findOne({
          createdBy: identity.value,
          archive: { $ne: true },
        })
          .sort({ lastOpenedAt: -1, editedAt: -1, updatedAt: -1 })
          .lean();

        if (latestFile) {
          return NextResponse.redirect(
            new URL(`/workspace/${latestFile._id}?view=canvas`, req.url)
          );
        }
      }

      // If user has no files or requested a new one, redirect to dashboard to create or select team
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Guest (unauthenticated) path
    const existingGuestId = await readGuestId();
    const guestId = existingGuestId ?? newGuestId();
    const guestIdent = guestIdentity(guestId);

    // If an existing guest visits without forcing a new file, reuse their active canvas
    if (existingGuestId && !forceNew) {
      const activeFile = await File.findOne({
        createdBy: guestIdent,
        archive: { $ne: true },
      })
        .sort({ lastOpenedAt: -1, editedAt: -1, updatedAt: -1 })
        .lean();

      if (activeFile) {
        const res = NextResponse.redirect(
          new URL(`/workspace/${activeFile._id}?view=canvas`, req.url)
        );
        res.cookies.set(GUEST_COOKIE, guestId, guestCookieOptions);
        return res;
      }
    }

    // Provision new guest canvas
    assertGuestCreationAllowed(clientIpFrom(req));
    const team = await ensureGuestTeam(guestId);

    const file = await File.create({
      fileName: "Free Canvas",
      teamId: team._id.toString(),
      createdBy: guestIdent,
      document: "",
      whiteboard: "",
      archive: false,
      starred: false,
      editedAt: new Date(),
      expiresAt: guestExpiryDate(),
    });

    const res = NextResponse.redirect(
      new URL(`/workspace/${file._id}?view=canvas`, req.url)
    );
    res.cookies.set(GUEST_COOKIE, guestId, guestCookieOptions);
    return res;
  } catch (error) {
    console.error("[canvas route error]:", error);
    // If rate-limited or error occurs, redirect to home page with a friendly prompt
    return NextResponse.redirect(new URL("/?canvasError=1", req.url));
  }
}
