import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAuth, signToken } from "@/lib/auth";
import { SITE_URL } from "@/lib/social/metaAuth";
import { getPinterestConfig, PIN_OAUTH_REDIRECT, PIN_SCOPES } from "@/lib/social/pinterestApi";

// GET /api/admin/social/pinterest/connect — start "Connect Pinterest" (admin)
export async function GET() {
  const user = (await requireAuth()).user;
  if (!user || user.role !== "admin") return NextResponse.redirect(`${SITE_URL}/admin/login`);
  const { appId, appSecret } = await getPinterestConfig();
  if (!appId || !appSecret) return NextResponse.redirect(`${SITE_URL}/admin/social-settings?pin=missing-app`);
  const state = signToken({ purpose: "pin-oauth", uid: String(user.id || ""), n: crypto.randomBytes(8).toString("hex") });
  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", PIN_OAUTH_REDIRECT);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", PIN_SCOPES.join(","));
  url.searchParams.set("state", state);
  const res = NextResponse.redirect(url.toString());
  res.cookies.set("pin_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
