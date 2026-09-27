import { NextResponse } from "next/server";
import {
  ensureGuestTeam,
  guestCookieOptions,
  guestExpiryDate,
  guestIdentity,
  newGuestId,
  readGuestId,
} from "@/lib/guest";
import { assertGuestCreationAllowed, clientIpFrom } from "@/lib/guest";
import { File } from "@/models/File";
import connectToDatabase from "@/lib/mongodb";
import { toErrorResponse } from "@/lib/access";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const forceNew = url.searchParams.get("new") === "true";

    const existingGuestId = (await readGuestId()) ?? newGuestId();
    const guestIdent = guestIdentity(existingGuestId);

    // Reuse existing guest workspace unless forced to create new
    if (!forceNew) {
      const activeFile = await File.findOne({
        createdBy: guestIdent,
        archive: { $ne: true },
      })
        .sort({ lastOpenedAt: -1, editedAt: -1, updatedAt: -1 })
        .lean();

      if (activeFile) {
        return NextResponse.redirect(new URL(`/workspace/${activeFile._id}`, req.url));
      }
    }

    // Allow in dev mode or check rate limit
    if (process.env.NODE_ENV !== "development") {
      assertGuestCreationAllowed(clientIpFrom(req));
    }

    // Create new guest workspace
    const team = await ensureGuestTeam(existingGuestId);
    const file = await File.create({
      fileName: "Untitled Canvas",
      teamId: team._id.toString(),
      createdBy: guestIdent,
      document: "",
      whiteboard: "",
      archive: false,
      starred: false,
      publicAccess: "edit",
      editedAt: new Date(),
      expiresAt: guestExpiryDate(),
    });

    const response = NextResponse.redirect(new URL(`/workspace/${file._id}`, req.url));
    response.cookies.set("guest_session", existingGuestId, guestCookieOptions);
    return response;
  } catch (error) {
    console.error("[workspace-start] Error:", error);
    return toErrorResponse(error);
  }
}
