import { NextResponse } from "next/server";

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory store: Map<"ip:pathname", { count, resetAt }>
const rateLimitStore = new Map();

const RATE_LIMITS = {
  "/api/subscribe":     { max: 3,  windowMs: 60 * 60 * 1000 },  // 3/hr
  "/api/contact":       { max: 5,  windowMs: 60 * 60 * 1000 },  // 5/hr
  "/api/comments":      { max: 10, windowMs: 60 * 60 * 1000 },  // 10/hr
  "/api/reviews":       { max: 5,  windowMs: 60 * 60 * 1000 },  // 5/hr
  "/api/leads":         { max: 10, windowMs: 60 * 60 * 1000 },  // 10/hr
  "/api/chatbot-leads": { max: 20, windowMs: 60 * 60 * 1000 },  // 20/hr
};

function getIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip, pathname) {
  const rule = RATE_LIMITS[pathname];
  if (!rule) return false;

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const rec = rateLimitStore.get(key);

  if (!rec || now > rec.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rule.windowMs });
    return false;
  }
  if (rec.count >= rule.max) return true;
  rec.count++;
  return false;
}

// ── Main proxy handler ────────────────────────────────────────────────────────
export function proxy(request) {
  const { pathname, method } = request.nextUrl;

  // Rate-limit public POST endpoints
  if (method === "POST" && isRateLimited(getIp(request), pathname)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Admin route protection
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage  = pathname === "/admin/login";
  const token        = request.cookies.get("admin-token")?.value;

  if (isAdminRoute && !isLoginPage) {
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Validate JWT structure and expiry (signature verified by requireAuth in API routes)
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
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/subscribe",
    "/api/contact",
    "/api/comments",
    "/api/reviews",
    "/api/leads",
    "/api/chatbot-leads",
  ],
};
