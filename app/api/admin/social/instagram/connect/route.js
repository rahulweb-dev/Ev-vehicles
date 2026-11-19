import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser, signToken } from "@/lib/auth";
import { SITE_URL } from "@/lib/social/metaAuth";
import { getIgAppCreds, IG_OAUTH_REDIRECT, IG_SCOPES } from "@/lib/social/instagramAuth";

// GET /api/admin/social/instagram/connect — start "Connect Instagram" (Instagram Login)
export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return NextResponse.redirect(`${SITE_URL}/admin/login`);
  const { igAppId, igAppSecret } = await getIgAppCreds();
  if (!igAppId || !igAppSecret) return NextResponse.redirect(`${SITE_URL}/admin/social-settings?ig=missing-app`);
  const state = signToken({ purpose: "ig-oauth", uid: String(user.id || user._id || user.email || ""), n: crypto.randomBytes(8).toString("hex") });
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("enable_fb_login", "0");
  url.searchParams.set("force_authentication", "1");
  url.searchParams.set("client_id", igAppId);
  url.searchParams.set("redirect_uri", IG_OAUTH_REDIRECT);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", IG_SCOPES.join(","));
  url.searchParams.set("state", state);
  const res = NextResponse.redirect(url.toString());
  res.cookies.set("ig_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
