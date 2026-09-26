import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { File } from "@/models/File";
import { requireFileAccess, toErrorResponse } from "@/lib/access";

type RouteContext = { params: Promise<{ id: string }> };

/** Marks the file as recently opened. Called when the workspace loads it. */
export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await requireFileAccess(user.email, id);

    await File.findByIdAndUpdate(id, { lastOpenedAt: new Date() });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
