import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser, signToken } from "@/lib/auth";
import { getAppCreds, OAUTH_REDIRECT, SCOPES, SITE_URL } from "@/lib/social/metaAuth";

// GET /api/admin/social/meta/connect — start "Connect with Facebook" (Facebook Login)
export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return NextResponse.redirect(`${SITE_URL}/admin/login`);
  const { appId } = await getAppCreds();
  if (!appId) return NextResponse.redirect(`${SITE_URL}/admin/social-settings?meta=missing-app`);
  const state = signToken({ purpose: "meta-oauth", uid: String(user.id || user._id || user.email || ""), n: crypto.randomBytes(8).toString("hex") });
  const url = new URL("https://www.facebook.com/v23.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", OAUTH_REDIRECT);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  const res = NextResponse.redirect(url.toString());
  // Bind the state to this browser so a forged callback can't be replayed elsewhere
  res.cookies.set("meta_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
