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

  await requireTeamAccess(email, file.teamId);

  return file;
}

/** Converts a thrown error into a JSON Response with the right status code. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Unhandled API error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
