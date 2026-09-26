import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { toErrorResponse } from "@/lib/access";
import { escapeRegExp } from "@/lib/validation";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

const clampInt = (value: string | null, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").trim();
    const role = searchParams.get("role") ?? "all";
    const plan = searchParams.get("plan") ?? "all";
    const page = clampInt(searchParams.get("page"), 1, 1, 10_000);
    const pageSize = clampInt(searchParams.get("pageSize"), 10, 1, 50);

    const query: Record<string, unknown> = {};
    if (search) {
      const rx = new RegExp(escapeRegExp(search), "i");
      query.$or = [{ email: rx }, { name: rx }];
    }
    if (role === "admin" || role === "user") query.role = role;
    if (plan === "free" || plan === "pro") query.plan = plan;

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select(
          "name email image role banned plan subscriptionStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
