import { NextResponse } from "next/server";
import { File } from "@/models/File";
import { getFileAccess, requireFileAccess, requireFileLevel, toErrorResponse } from "@/lib/access";
import { resolveIdentity } from "@/lib/identity";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const identity = await resolveIdentity();
    const { id } = await params;

    // No identity is fine here: a shared link is opened by a brand-new visitor
    // before any session exists, so the file's own setting decides.
    const { file, level } = await getFileAccess(identity?.value ?? null, id);
    if (!level) {
      // Guest cookies get a 200 with isGuest: true so the client can render
      // the sign-up prompt instead of a dead-end error.
      const response = NextResponse.json(
        { ok: false, error: "File not found", isGuest: identity?.isGuest ?? false },
        { status: 404 }
      );
      return response;
    }

    // `accessLevel` tells the client whether to mount the editor read-only.
    return NextResponse.json({ ok: true, ...file, accessLevel: level });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const identity = await resolveIdentity();
    const { id } = await params;

    const { level } = await requireFileLevel(identity?.value ?? null, id, "edit");

    const data = await req.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Whitelist fields so a client cannot overwrite ownership/identity fields.
    const update: Record<string, unknown> = { editedAt: new Date() };

    if (typeof data.document === "string") update.document = data.document;
    if (typeof data.whiteboard === "string") update.whiteboard = data.whiteboard;

    // Archiving, starring and renaming are owner actions. A link-holder with
    // edit rights may change the *content*, but must not be able to hide or
    // rename someone else's file.
    if (level === "owner") {
      if (typeof data.archive === "boolean") update.archive = data.archive;
      if (typeof data.starred === "boolean") update.starred = data.starred;
      if (typeof data.fileName === "string" && data.fileName.trim()) {
        update.fileName = data.fileName.trim();
      }
    }

    const updatedFile = await File.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json(updatedFile);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const identity = await resolveIdentity();
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Deleting always requires ownership, never public edit access.
    await requireFileAccess(identity.value, id);

    await File.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
