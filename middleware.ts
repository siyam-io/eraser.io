import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.url ? new URL(request.url) : request.nextUrl;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Admin routes are ALWAYS strict — even in development. The admin panel
  // manages users, payments, and platform settings, so there is no bypass.
  if (isAdminRoute) {
    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // In dev mode, allow all access for easier development
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Protect authenticated app routes + the admin panel.
//
// `/workspace/:path*` is deliberately NOT matched: a workspace is reachable by
// anonymous guests as well as signed-in users, so a blanket redirect to /login
// would break every shared and guest link. Authorization for a workspace lives
// in the API instead (`requireFileAccess`), where it can be per-file.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teams/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
