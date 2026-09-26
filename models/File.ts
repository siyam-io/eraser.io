import mongoose, { Schema, models } from "mongoose";

const FileSchema = new Schema(
  {
    fileName: { type: String, required: true },
    teamId: { type: String, required: true }, // Referencing Team ID
    createdBy: { type: String, required: true }, // User email
    archive: { type: Boolean, default: false },
    starred: { type: Boolean, default: false },
    document: { type: String, default: "" }, // EditorJS stringified JSON
    whiteboard: { type: String, default: "" }, // Excalidraw stringified JSON
    editedAt: { type: Date },
    lastOpenedAt: { type: Date },
  },
  { timestamps: true }
);

FileSchema.index({ teamId: 1 });
FileSchema.index({ createdBy: 1 });
FileSchema.index({ teamId: 1, starred: 1 });

export const File = models.File || mongoose.model("File", FileSchema);
