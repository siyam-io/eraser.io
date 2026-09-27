import { NextResponse } from "next/server";
import { File } from "@/models/File";
import { requireFileLevel, toErrorResponse } from "@/lib/access";
import { resolveIdentity } from "@/lib/identity";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Persists the live CRDT snapshot for a file.
 *
 * This is deliberately separate from `PUT /api/files/[id]`: that endpoint is a
 * blind last-write-wins replacement, which is fine for an explicit user save
 * but unsafe for a background flush that can race with another collaborator.
 * Here the write is conditional on `collabRevision` being strictly newer than
 * whatever is already stored, so an out-of-order flush is dropped rather than
 * clobbering fresher state.
 */
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const identity = await resolveIdentity();
    const { id } = await params;

    // View-only participants cannot flush state, or a read-only visitor could
    // rewrite the document they were only invited to look at.
    await requireFileLevel(identity?.value ?? null, id, "edit");

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const revision = (body as any).revision;
    if (typeof revision !== "number" || !Number.isFinite(revision)) {
      return NextResponse.json({ error: "revision is required" }, { status: 400 });
    }

    const update: Record<string, unknown> = {
      editedAt: new Date(),
      collabRevision: revision,
    };

    if (typeof (body as any).document === "string") update.document = (body as any).document;
    if (typeof (body as any).whiteboard === "string") update.whiteboard = (body as any).whiteboard;

    const updated = await File.findOneAndUpdate(
      { _id: id, collabRevision: { $lt: revision } },
      { $set: update },
      { new: true }
    );

    // A concurrent (newer) flush already landed; this one is a no-op, not an
    // error — the client shouldn't retry or surface a failure.
    if (!updated) return NextResponse.json({ ok: true, skipped: true });

    return NextResponse.json({ ok: true, revision });
  } catch (error) {
    return toErrorResponse(error);
  }
}
