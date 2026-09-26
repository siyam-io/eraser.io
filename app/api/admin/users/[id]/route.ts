import { NextResponse } from "next/server";
import { requireAdmin, findUserById } from "@/lib/admin";
import { toErrorResponse, HttpError } from "@/lib/access";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { File } from "@/models/File";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** GET — full profile: user fields + teams, file counts, recent files. */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    await connectToDatabase();

    const user = await findUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    const email = user.email;
    const [teams, totalFiles, activeFiles, recentFiles] = await Promise.all([
      Team.find({ createdBy: email })
        .sort({ createdAt: -1 })
        .select("teamName createdAt")
        .lean(),
      File.countDocuments({ createdBy: email }),
      File.countDocuments({ createdBy: email, archive: false }),
      File.find({ createdBy: email })
        .sort({ editedAt: -1, createdAt: -1 })
        .limit(8)
        .select("fileName createdAt editedAt archive starred")
        .lean(),
    ]);

    return NextResponse.json({
      user,
      teams,
      fileStats: { total: totalFiles, active: activeFiles, archived: totalFiles - activeFiles },
      recentFiles,
      isSelf: admin.email === email,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** PATCH — edit name, change role, ban/unban. */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    await connectToDatabase();

    const user = await findUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      throw new HttpError(400, "Invalid request body");
    }

    const update: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length < 1 || name.length > 100) {
        throw new HttpError(400, "Name must be 1–100 characters");
      }
      update.name = name;
    }

    if (body.role !== undefined) {
      if (body.role !== "user" && body.role !== "admin") {
        throw new HttpError(400, "Role must be 'user' or 'admin'");
      }
      // Never let the last admin demote themselves out of the panel.
      if (admin.id === id && body.role !== "admin") {
        throw new HttpError(400, "You cannot demote your own account");
      }
      update.role = body.role;
    }

    if (body.banned !== undefined) {
      if (typeof body.banned !== "boolean") {
        throw new HttpError(400, "banned must be a boolean");
      }
      if (admin.id === id && body.banned) {
        throw new HttpError(400, "You cannot ban your own account");
      }
      update.banned = body.banned;
    }

    if (Object.keys(update).length === 0) {
      throw new HttpError(400, "Nothing to update");
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    )
      .select(
        "name email image role banned plan subscriptionStatus createdAt updatedAt"
      )
      .lean();

    return NextResponse.json({ user: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** DELETE — hard-delete the user plus the files and teams they own. */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    await connectToDatabase();

    const user = await findUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    if (admin.id === id) {
      throw new HttpError(400, "You cannot delete your own account");
    }

    const email = user.email;
    const [files, teams] = await Promise.all([
      File.deleteMany({ createdBy: email }),
      Team.deleteMany({ createdBy: email }),
      User.deleteOne({ _id: id }),
    ]);

    return NextResponse.json({
      deleted: {
        user: 1,
        files: files.deletedCount ?? 0,
        teams: teams.deletedCount ?? 0,
      },
      email,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
