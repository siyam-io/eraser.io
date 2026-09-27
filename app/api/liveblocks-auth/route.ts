import { NextResponse } from "next/server";
import { getFileAccess, toErrorResponse } from "@/lib/access";
import { colorForUser } from "@/lib/collab";
import { guestIdentity, newGuestId, setGuestCookie } from "@/lib/guest";
import { resolveIdentity } from "@/lib/identity";
import { getLiveblocksServer, isLiveblocksConfigured } from "@/lib/liveblocks";

/**
 * Liveblocks authentication endpoint.
 *
 * The room id is the file id, so a room is exactly as private as the file it
 * belongs to. Access is resolved through the same `getFileAccess` check the
 * REST API uses, which means a shared link grants a token on the same terms as
 * it grants HTTP reads — the two surfaces cannot drift apart.
 */
export async function POST(req: Request) {
  try {
    if (!isLiveblocksConfigured()) {
      return NextResponse.json(
        { error: "Real-time collaboration is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    const room = typeof body?.room === "string" ? body.room : "";
    if (!room) {
      return NextResponse.json({ error: "room is required" }, { status: 400 });
    }

    const identity = await resolveIdentity();
    // A missing identity is expected for a first-time visitor on a shared
    // link, so this must not short-circuit to 401 the way it used to.
    const { level } = await getFileAccess(identity?.value ?? null, room);

    if (!level) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    let actor = identity;
    if (!actor) {
      // Give the visitor a guest identity before minting the token. Without a
      // stable userId their presence would be recreated on every reconnect,
      // so their cursor would jump and others would see duplicate users.
      const guestId = newGuestId();
      await setGuestCookie(guestId);
      actor = { value: guestIdentity(guestId), isGuest: true, name: "Guest", image: null };
    }

    const liveblocks = getLiveblocksServer();
    const session = liveblocks.prepareSession(actor.value, {
      userInfo: {
        name: actor.name,
        avatar: actor.image || undefined,
        color: colorForUser(actor.value),
      },
    });

    // View-only participants get read access, so a write attempt is rejected by
    // Liveblocks even if a client ignored its own read-only UI.
    session.allow(room, level === "view" ? session.READ_ACCESS : session.FULL_ACCESS);

    const { body: token, status } = await session.authorize();
    return new Response(token, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
