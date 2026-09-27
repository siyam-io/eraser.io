import { NextResponse } from "next/server";
import { File } from "@/models/File";
import { getFileAccess, requireFileAccess, toErrorResponse } from "@/lib/access";
import { resolveIdentity } from "@/lib/identity";

type RouteContext = { params: Promise<{ id: string }> };

const LEVELS = ["private", "view", "edit"] as const;
type Level = (typeof LEVELS)[number];

const isLevel = (value: unknown): value is Level =>
  typeof value === "string" && (LEVELS as readonly string[]).includes(value);

/** Current link-sharing setting, plus whether the caller may change it. */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const identity = await resolveIdentity();
    const { id } = await params;

    const { file, level } = await getFileAccess(identity?.value ?? null, id);
    if (!level) {
      return NextResponse.json(
        { ok: false, error: "File not found", isGuest: identity?.isGuest ?? false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      publicAccess: (file.publicAccess as Level) ?? "private",
      canManage: level === "owner",
      accessLevel: level,
      isGuest: identity?.isGuest ?? false,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Changes who can use the link.
 *
 * Owner-only on purpose: if a public editor could call this, a link-holder
 * could widen the file's exposure further or flip it private to lock the
 * owner out of their own document.
 */
export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const identity = await resolveIdentity();
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await requireFileAccess(identity.value, id);

    const body = await req.json().catch(() => null);
    if (!isLevel(body?.publicAccess)) {
      return NextResponse.json(
        { error: "publicAccess must be one of: private, view, edit" },
        { status: 400 }
      );
    }

    const updated = await File.findByIdAndUpdate(
      id,
      { $set: { publicAccess: body.publicAccess } },
      { new: true }
    );

    return NextResponse.json({ publicAccess: (updated?.publicAccess as Level) ?? body.publicAccess });
  } catch (error) {
    return toErrorResponse(error);
  }
}
