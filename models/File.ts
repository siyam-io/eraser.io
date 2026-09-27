import mongoose, { Schema, models } from "mongoose";

const FileSchema = new Schema(
  {
    fileName: { type: String, required: true },
    teamId: { type: String, required: true }, // Referencing Team ID
    createdBy: { type: String, required: true }, // User email
    archive: { type: Boolean, default: false },
    starred: { type: Boolean, default: false },
    /**
     * Who can open this file by URL alone.
     *
     * - `private`: only the owning team (the default).
     * - `view`: anyone with the link can read it.
     * - `edit`: anyone with the link can write to it. The URL is then a write
     *   credential, so this is opt-in and revocable per file.
     */
    publicAccess: {
      type: String,
      enum: ["private", "view", "edit"],
      default: "edit",
    },
    document: { type: String, default: "" }, // EditorJS stringified JSON
    whiteboard: { type: String, default: "" }, // Excalidraw stringified JSON
    // Monotonic clock for real-time flushes. A background snapshot is only
    // written when its revision is newer, so races resolve instead of
    // silently overwriting fresher state.
    collabRevision: { type: Number, default: 0 },
    editedAt: { type: Date },
    lastOpenedAt: { type: Date },
    // Set only for anonymous (guest) workspaces, cleared when a guest signs up
    // and the file is claimed. Nothing deletes on this yet: a MongoDB TTL
    // index (`expiresAfterSeconds: 0`, sparse) would auto-remove guest files,
    // which is a data-deletion decision to opt into deliberately rather than
    // have enabled silently by a model change.
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

FileSchema.index({ teamId: 1 });
FileSchema.index({ createdBy: 1 });
FileSchema.index({ teamId: 1, starred: 1 });

export const File = models.File || mongoose.model("File", FileSchema);
