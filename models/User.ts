import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    image: { type: String },
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],

    // Billing
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String },
    subscriptionStatus: { type: String },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User = models.User || mongoose.model("User", UserSchema);
