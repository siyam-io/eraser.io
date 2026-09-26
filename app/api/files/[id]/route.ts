import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { File } from "@/models/File";
import { requireFileAccess, toErrorResponse } from "@/lib/access";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const file = await requireFileAccess(user.email, id);

    return NextResponse.json(file);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await requireFileAccess(user.email, id);

    const data = await req.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Whitelist fields so a client cannot overwrite ownership/identity fields.
    const update: Record<string, unknown> = { editedAt: new Date() };

    if (typeof data.document === "string") update.document = data.document;
    if (typeof data.whiteboard === "string") update.whiteboard = data.whiteboard;
    if (typeof data.archive === "boolean") update.archive = data.archive;
    if (typeof data.starred === "boolean") update.starred = data.starred;
    if (typeof data.fileName === "string" && data.fileName.trim()) {
      update.fileName = data.fileName.trim();
    }

    const updatedFile = await File.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json(updatedFile);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await requireFileAccess(user.email, id);

    await File.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
