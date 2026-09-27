import { NextResponse } from "next/server";
import { File } from "@/models/File";
import { requireFileLevel, toErrorResponse } from "@/lib/access";
import { resolveIdentity } from "@/lib/identity";

type RouteContext = { params: Promise<{ id: string }> };

/** Marks the file as recently opened. Called when the workspace loads it. */
export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const identity = await resolveIdentity();
    const { id } = await params;

    // Anyone who can open the file (including via a shared link) counts as an
    // open; "Recent" in the dashboard is meant to reflect file activity.
    await requireFileLevel(identity?.value ?? null, id, "view");

    await File.findByIdAndUpdate(id, { lastOpenedAt: new Date() });

    return NextResponse.json({ ok: true, isGuest: identity?.isGuest ?? false });
  } catch (error) {
    return toErrorResponse(error);
  }
}
