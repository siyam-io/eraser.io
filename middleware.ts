import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // In dev mode, allow all access for easier development
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Protect authenticated app routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
    "/teams/:path*",
    "/settings/:path*",
  ],
};