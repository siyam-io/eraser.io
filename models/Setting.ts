import mongoose, { Schema, models } from "mongoose";

/**
 * Singleton platform settings document (key === "global").
 * Written only by admin API routes; read by the auth flow.
 */
const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    /** When false, new registrations are rejected (existing users still sign in). */
    allowSignups: { type: Boolean, default: true },
    /**
     * When true, only admins can sign in — a maintenance kill-switch.
     * Admins are exempt so the platform can never lock itself out.
     */
    maintenance: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Setting = models.Setting || mongoose.model("Setting", SettingSchema);
