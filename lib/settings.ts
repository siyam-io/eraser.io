import connectToDatabase from "@/lib/mongodb";
import { Setting } from "@/models/Setting";

export interface PlatformSettings {
  allowSignups: boolean;
  maintenance: boolean;
}

const DEFAULTS: PlatformSettings = { allowSignups: true, maintenance: false };
const GLOBAL_KEY = "global";

/**
 * Reads the singleton platform settings document. Never throws — missing doc
 * or a database hiccup falls back to permissive defaults so auth keeps working.
 */
export async function getSettings(): Promise<PlatformSettings> {
  try {
    await connectToDatabase();
    const doc = await Setting.findOne({ key: GLOBAL_KEY }).lean();
    if (!doc) return { ...DEFAULTS };
    return {
      allowSignups: doc.allowSignups !== false,
      maintenance: Boolean(doc.maintenance),
    };
  } catch (error) {
    console.error("[settings] failed to read settings:", error);
    return { ...DEFAULTS };
  }
}

/** Creates-or-updates the singleton settings document. */
export async function updateSettings(
  patch: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  await connectToDatabase();
  const doc = await Setting.findOneAndUpdate(
    { key: GLOBAL_KEY },
    { $set: { ...patch } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    allowSignups: doc.allowSignups !== false,
    maintenance: Boolean(doc.maintenance),
  };
}
