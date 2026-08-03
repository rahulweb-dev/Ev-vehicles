import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic JWT structure + expiry check (signature verified by requireAuth in API routes)
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("invalid");
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp || payload.exp < Date.now() / 1000) throw new Error("expired");
  } catch {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
