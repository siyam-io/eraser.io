import { NextResponse } from "next/server";
import { File } from "@/models/File";
import { assertCanCreateFile } from "@/lib/billing";
import { toErrorResponse } from "@/lib/access";
import { resolveIdentity } from "@/lib/identity";
import { ensurePersonalTeam } from "@/lib/onboarding";
import connectToDatabase from "@/lib/mongodb";
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

const MAX_FILE_NAME_LENGTH = 200;

/**
 * Creates a workspace.
 *
 * If the user is signed in, creates a permanent file in their personal team.
 * If the user is a guest, provisions a throwaway guest team, sets publicAccess: "edit",
 * and stamps the browser with the guest session cookie.
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json().catch(() => null);
    const requested = typeof body?.fileName === "string" ? body.fileName.trim() : "";
    const fileName = (requested || "Untitled Canvas").slice(0, MAX_FILE_NAME_LENGTH);

    // If user is already authenticated, create a file under their real account
    const identity = await resolveIdentity();
    if (identity && !identity.isGuest) {
      await assertCanCreateFile(identity.value);
      const team = await ensurePersonalTeam(identity.value, identity.name);

      const file = await File.create({
        fileName,
        teamId: team._id.toString(),
        createdBy: identity.value,
        document: "",
        whiteboard: "",
        archive: false,
        starred: false,
        editedAt: new Date(),
      });

      return NextResponse.json(
        { fileId: file._id.toString(), guest: false },
        { status: 201 }
      );
    }

    // Guest user flow
    assertGuestCreationAllowed(clientIpFrom(req));

    const guestId = (await readGuestId()) ?? newGuestId();
    const guestIdent = guestIdentity(guestId);

    const team = await ensureGuestTeam(guestId);
    await assertCanCreateFile(guestIdent);

    const file = await File.create({
      fileName,
      teamId: team._id.toString(),
      createdBy: guestIdent,
      document: "",
      whiteboard: "",
      archive: false,
      starred: false,
      publicAccess: "edit", // Guest files can be accessed immediately by URL without auth blocking
      editedAt: new Date(),
      expiresAt: guestExpiryDate(),
    });

    const response = NextResponse.json(
      { fileId: file._id.toString(), guest: true },
      { status: 201 }
    );
    response.cookies.set(GUEST_COOKIE, guestId, guestCookieOptions);
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
