import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { toErrorResponse } from "@/lib/access";
import { escapeRegExp } from "@/lib/validation";

const MAX_TEAM_NAME_LENGTH = 100;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let teams = await Team.find({ createdBy: user.email })
      .sort({ createdAt: -1 })
      .lean();

    // Fallback for teams created before emails were normalized to lowercase.
    if (teams.length === 0) {
      teams = await Team.find({
        createdBy: { $regex: `^${escapeRegExp(user.email)}$`, $options: "i" },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json(teams);
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

    const existingTeam = await Team.findOne({ teamName, createdBy: user.email }).lean();
    if (existingTeam) {
      return NextResponse.json({ error: "You already have a team with this name" }, { status: 409 });
    }

    const newTeam = await Team.create({ teamName, createdBy: user.email });

    await User.findOneAndUpdate(
      { email: user.email },
      { $addToSet: { teams: newTeam._id } }
    );

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
