import { NextResponse } from "next/server";
import { File } from "@/models/File";
import { requireTeamAccess, toErrorResponse } from "@/lib/access";
import { assertCanCreateFile } from "@/lib/billing";
import { ensureGuestTeam, guestExpiryDate, readGuestId } from "@/lib/guest";
import { resolveIdentity } from "@/lib/identity";

const MAX_FILE_NAME_LENGTH = 200;

type View = "all" | "recent" | "starred" | "archived";

const isView = (value: string | null): value is View =>
  value === "all" || value === "recent" || value === "starred" || value === "archived";

export async function GET(req: Request) {
  try {
    const identity = await resolveIdentity();
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const viewParam = searchParams.get("view");
    const view: View = isView(viewParam) ? viewParam : "all";

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 });
    }

    // Throws 404 if the signed-in user does not own the team.
    await requireTeamAccess(identity.value, teamId);

    const query: Record<string, unknown> = {
      teamId,
      archive: view === "archived",
    };
    if (view === "starred") query.starred = true;

    const sort: Record<string, 1 | -1> =
      view === "recent"
        ? { lastOpenedAt: -1, editedAt: -1 }
        : { createdAt: -1 };

    const files = await File.find(query).sort(sort).lean();

    return NextResponse.json(files);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const identity = await resolveIdentity();
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const fileName = typeof body?.fileName === "string" ? body.fileName.trim() : "";
    let teamId = typeof body?.teamId === "string" ? body.teamId : "";

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }
    if (fileName.length > MAX_FILE_NAME_LENGTH) {
      return NextResponse.json(
        { error: `fileName must be at most ${MAX_FILE_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!teamId) {
      if (!identity.isGuest) {
        return NextResponse.json({ error: "teamId is required" }, { status: 400 });
      }
      // A guest owns exactly one throwaway team, provisioned on first use.
      const guestId = await readGuestId();
      if (!guestId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      teamId = (await ensureGuestTeam(guestId))._id.toString();
    }

    await requireTeamAccess(identity.value, teamId);

    // Server-side plan enforcement (returns 402 when the limit is hit).
    await assertCanCreateFile(identity.value);

    const newFile = await File.create({
      fileName,
      teamId,
      // Identity always comes from the session/cookie, never the request body.
      createdBy: identity.value,
      document: typeof body?.document === "string" ? body.document : "",
      whiteboard: typeof body?.whiteboard === "string" ? body.whiteboard : "",
      archive: false,
      starred: false,
      publicAccess: "edit",
      editedAt: new Date(),
      ...(identity.isGuest ? { expiresAt: guestExpiryDate() } : {}),
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
