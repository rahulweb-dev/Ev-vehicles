import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth, verifyToken } from "@/lib/auth";
import { SITE_URL } from "@/lib/social/metaAuth";
import { getIgAppCreds, igExchangeCode, igSubscribeWebhooks, saveIgConnection } from "@/lib/social/instagramAuth";

export const maxDuration = 60;

// GET /api/admin/social/instagram/callback?code=..&state=.. — Instagram redirects here after login.
// state.target "site" = the site's own Instagram (admin), "account" = the user's own account (My Social).
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const state = sp.get("state") || "";
  const payload = verifyToken(state);
  const forAccount = payload?.target === "account";
  const base = forAccount ? "/admin/my-social" : "/admin/social-settings";
  const back = (q) => NextResponse.redirect(`${SITE_URL}${base}?ig=${q}`);

  const user = (await requireAuth()).user;
  if (!user || (!forAccount && user.role !== "admin")) return NextResponse.redirect(`${SITE_URL}/admin/login`);
  if (sp.get("error")) return back("denied&reason=" + encodeURIComponent((sp.get("error_description") || sp.get("error")).slice(0, 150)));
  const cookieState = (await cookies()).get("ig_oauth_state")?.value;
  if (!state || state !== cookieState || payload?.purpose !== "ig-oauth" || payload.uid !== String(user.id || "")) return back("bad-state");

  try {
    const creds = await getIgAppCreds();
    const { token, expiresIn, me } = await igExchangeCode(sp.get("code") || "", creds);
    const webhook = await igSubscribeWebhooks(token);
    if (forAccount) {
      const { saveInstagramAccount } = await import("@/lib/social/accounts");
      await saveInstagramAccount(user.id, { token, expiresIn, me, webhook });
    } else {
      await saveIgConnection({ token, expiresIn, me, webhook });
    }
    const res = back("connected");
    res.cookies.delete("ig_oauth_state");
    return res;
  } catch (e) {
    console.error("[instagram oauth callback]", e.message);
    return back("error&reason=" + encodeURIComponent(e.message.slice(0, 150)));
  }
}
