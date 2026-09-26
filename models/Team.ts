import mongoose, { Schema, models } from "mongoose";

const TeamSchema = new Schema(
  {
    teamName: { type: String, required: true },
    createdBy: { type: String, required: true }, // User email or ID
  },
  { timestamps: true }
);

export const Team = models.Team || mongoose.model("Team", TeamSchema);
