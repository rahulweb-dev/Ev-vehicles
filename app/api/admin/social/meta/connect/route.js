import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAuth, signToken } from "@/lib/auth";
import { getAppCreds, OAUTH_REDIRECT, SCOPES, SITE_URL } from "@/lib/social/metaAuth";

// GET /api/admin/social/meta/connect            — admin: connect the site's own Facebook Page
// GET /api/admin/social/meta/connect?for=me     — any logged-in user: connect their own Pages (My Social)
export async function GET(request) {
  const forMe = new URL(request.url).searchParams.get("for") === "me";
  const auth = await requireAuth();
  const user = auth.user;
  if (!user || (!forMe && user.role !== "admin")) return NextResponse.redirect(`${SITE_URL}/admin/login`);
  const back = forMe ? "/admin/my-social" : "/admin/social-settings";
  const { appId, appSecret } = await getAppCreds();
  if (!appId || !appSecret) return NextResponse.redirect(`${SITE_URL}${back}?meta=missing-app`);
  const state = signToken({ purpose: "meta-oauth", target: forMe ? "account" : "site", uid: String(user.id || ""), n: crypto.randomBytes(8).toString("hex") });
  const url = new URL("https://www.facebook.com/v23.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", OAUTH_REDIRECT);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  // Always show the Page picker again so users can add or remove Pages
  url.searchParams.set("auth_type", "rerequest");
  const res = NextResponse.redirect(url.toString());
  // Bind the state to this browser so a forged callback can't be replayed elsewhere
  res.cookies.set("meta_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
