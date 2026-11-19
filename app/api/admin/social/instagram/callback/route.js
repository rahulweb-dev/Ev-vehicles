import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser, verifyToken } from "@/lib/auth";
import { SITE_URL } from "@/lib/social/metaAuth";
import { getIgAppCreds, igExchangeCode, igSubscribeWebhooks, saveIgConnection } from "@/lib/social/instagramAuth";

// GET /api/admin/social/instagram/callback?code=..&state=.. — Instagram redirects here after login
export async function GET(request) {
  const back = (q) => NextResponse.redirect(`${SITE_URL}/admin/social-settings?ig=${q}`);
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return NextResponse.redirect(`${SITE_URL}/admin/login`);

  const sp = new URL(request.url).searchParams;
  if (sp.get("error")) return back("denied&reason=" + encodeURIComponent((sp.get("error_description") || sp.get("error")).slice(0, 150)));
  const state = sp.get("state") || "";
  const cookieState = (await cookies()).get("ig_oauth_state")?.value;
  if (!state || state !== cookieState || verifyToken(state)?.purpose !== "ig-oauth") return back("bad-state");

  try {
    const creds = await getIgAppCreds();
    const { token, expiresIn, me } = await igExchangeCode(sp.get("code") || "", creds);
    const webhook = await igSubscribeWebhooks(token);
    await saveIgConnection({ token, expiresIn, me, webhook });
    const res = back("connected");
    res.cookies.delete("ig_oauth_state");
    return res;
  } catch (e) {
    console.error("[instagram oauth callback]", e.message);
    return back("error&reason=" + encodeURIComponent(e.message.slice(0, 150)));
  }
}
