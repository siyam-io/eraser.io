import connectToDatabase from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { normalizeEmail } from "@/lib/validation";

/** Human-friendly default name for a user's first team. */
export function defaultTeamName(name?: string | null, email?: string | null): string {
  const base = name?.trim() || email?.split("@")[0] || "My";
  return `${base}'s Workspace`;
}

/**
 * Ensures the user owns at least one team and returns it. Idempotent: a second
 * call returns the existing team rather than creating a duplicate. Without this,
 * brand-new users have no team and cannot create files at all.
 */
export async function ensurePersonalTeam(email: string, name?: string | null) {
  const normalized = normalizeEmail(email);
  await connectToDatabase();

  const existing = await Team.findOne({ createdBy: normalized });
  if (existing) return existing;

  const team = await Team.create({
    teamName: defaultTeamName(name, normalized),
    createdBy: normalized,
  });

  await User.findOneAndUpdate(
    { email: normalized },
    { $addToSet: { teams: team._id } }
  );

  return team;
}
