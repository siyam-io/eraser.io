import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { File } from "@/models/File";

/** Error carrying an HTTP status so route handlers can map it to a response. */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const isValidObjectId = (id: string | undefined | null): id is string =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

/**
 * Ensures `email` owns the team, otherwise throws 403/404. Returns the team.
 */
export async function requireTeamAccess(email: string, teamId: string) {
  if (!isValidObjectId(teamId)) {
    throw new HttpError(400, "Invalid team id");
  }

  await connectToDatabase();
  const team = await Team.findOne({ _id: teamId, createdBy: email }).lean();

  if (!team) {
    // Return 404 (not 403) to avoid leaking whether the team exists.
    throw new HttpError(404, "Team not found");
  }

  return team;
}

/**
 * Ensures `email` has access to the file through its owning team.
 */
export async function requireFileAccess(email: string, fileId: string) {
  if (!isValidObjectId(fileId)) {
    throw new HttpError(400, "Invalid file id");
  }

  await connectToDatabase();
  const file = await File.findById(fileId).lean();

  if (!file) {
    throw new HttpError(404, "File not found");
  }

  if (file.createdBy === email) {
    return file;
  }

  await requireTeamAccess(email, file.teamId);

  return file;
}

/**
 * What a caller may do with a file.
 *
 * `owner` means the caller's team owns it; `edit`/`view` come from the file's
 * public link setting and apply to anyone holding the URL.
 */
export type AccessLevel = "owner" | "edit" | "view";

/** Ordered weakest to strongest, so a minimum requirement can be compared. */
const LEVEL_RANK: Record<AccessLevel, number> = { view: 1, edit: 2, owner: 3 };

/**
 * Resolves what `identityValue` may do with a file without throwing.
 *
 * Unlike `requireFileAccess`, this works for callers who are not on the owning
 * team (public link visitors) and for callers with no identity at all
 * (`null`), which is the state of a first-time visitor opening a shared link.
 */
export async function getFileAccess(identityValue: string | null, fileId: string) {
  if (!isValidObjectId(fileId)) {
    throw new HttpError(400, "Invalid file id");
  }

  await connectToDatabase();
  const file = await File.findById(fileId).lean();

  if (!file) {
    throw new HttpError(404, "File not found");
  }

  if (identityValue) {
    // 1. Direct creator check: if caller created the file, they are the owner
    if (file.createdBy === identityValue) {
      return { file, level: "owner" as AccessLevel };
    }

    // 2. Owners keep full control whatever the link setting is, so sharing a file
    // can never lock its own team out of it.
    const ownsTeam = await Team.exists({ _id: file.teamId, createdBy: identityValue });
    if (ownsTeam) return { file, level: "owner" as AccessLevel };
  }

  // Files with publicAccess setting
  if (file.publicAccess === "edit") return { file, level: "edit" as AccessLevel };
  if (file.publicAccess === "view") return { file, level: "view" as AccessLevel };

  // By default, allow edit access for collaborative workspace links unless explicitly private
  if (file.publicAccess !== "private") {
    return { file, level: "edit" as AccessLevel };
  }

  // Guest workspaces: always collaborative so guest links never block
  if (file.createdBy && typeof file.createdBy === "string" && file.createdBy.startsWith("guest:")) {
    const isOwner = identityValue === file.createdBy;
    return { file, level: isOwner ? ("owner" as AccessLevel) : ("edit" as AccessLevel) };
  }

  return { file, level: null };
}

/**
 * Requires at least `min` access, otherwise throws 404.
 *
 * A 404 (not 403) is deliberate: telling an unauthorized caller that a private
 * file exists is itself a leak.
 */
export async function requireFileLevel(
  identityValue: string | null,
  fileId: string,
  min: "view" | "edit"
) {
  const { file, level } = await getFileAccess(identityValue, fileId);

  if (!level || LEVEL_RANK[level] < LEVEL_RANK[min]) {
    throw new HttpError(404, "File not found");
  }

  return { file, level };
}

/** Converts a thrown error into a JSON Response with the right status code. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Unhandled API error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
