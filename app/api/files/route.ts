import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { File } from "@/models/File";
import { requireTeamAccess, toErrorResponse } from "@/lib/access";
import { assertCanCreateFile } from "@/lib/billing";

const MAX_FILE_NAME_LENGTH = 200;

type View = "all" | "recent" | "starred" | "archived";

const isView = (value: string | null): value is View =>
  value === "all" || value === "recent" || value === "starred" || value === "archived";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
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
    await requireTeamAccess(user.email, teamId);

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
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const fileName = typeof body?.fileName === "string" ? body.fileName.trim() : "";
    const teamId = typeof body?.teamId === "string" ? body.teamId : "";

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }
    if (fileName.length > MAX_FILE_NAME_LENGTH) {
      return NextResponse.json(
        { error: `fileName must be at most ${MAX_FILE_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    await requireTeamAccess(user.email, teamId);

    // Server-side plan enforcement (returns 402 when the limit is hit).
    await assertCanCreateFile(user.email);

    const newFile = await File.create({
      fileName,
      teamId,
      // Identity always comes from the session, never the request body.
      createdBy: user.email,
      document: typeof body?.document === "string" ? body.document : "",
      whiteboard: typeof body?.whiteboard === "string" ? body.whiteboard : "",
      archive: false,
      starred: false,
      editedAt: new Date(),
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
