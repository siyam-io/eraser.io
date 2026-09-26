import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Team } from "@/models/Team";
import { File } from "@/models/File";
import { User } from "@/models/User";
import { requireTeamAccess, toErrorResponse } from "@/lib/access";

const MAX_TEAM_NAME_LENGTH = 100;

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await requireTeamAccess(user.email, id);

    const body = await req.json().catch(() => null);
    const teamName = typeof body?.teamName === "string" ? body.teamName.trim() : "";

    if (!teamName) {
      return NextResponse.json({ error: "teamName is required" }, { status: 400 });
    }
    if (teamName.length > MAX_TEAM_NAME_LENGTH) {
      return NextResponse.json(
        { error: `teamName must be at most ${MAX_TEAM_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    const updated = await Team.findByIdAndUpdate(id, { teamName }, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await requireTeamAccess(user.email, id);

    // Cascade: remove every file in the team, then the team and its references.
    await File.deleteMany({ teamId: id });
    await Team.findByIdAndDelete(id);
    await User.updateMany({ teams: id }, { $pull: { teams: id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
