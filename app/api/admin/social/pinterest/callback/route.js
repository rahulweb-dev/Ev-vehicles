import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth, verifyToken } from "@/lib/auth";
import { SITE_URL } from "@/lib/social/metaAuth";
import { pinterestConnect } from "@/lib/social/pinterestApi";

export const maxDuration = 30;

// GET /api/admin/social/pinterest/callback?code=..&state=.. — Pinterest redirects here after login
export async function GET(request) {
  const back = (q) => NextResponse.redirect(`${SITE_URL}/admin/social-settings?pin=${q}`);
  const user = (await requireAuth()).user;
  if (!user || user.role !== "admin") return NextResponse.redirect(`${SITE_URL}/admin/login`);
  const sp = new URL(request.url).searchParams;
  if (sp.get("error")) return back("denied");
  const state = sp.get("state") || "";
  const cookieState = (await cookies()).get("pin_oauth_state")?.value;
  const payload = verifyToken(state);
  if (!state || state !== cookieState || payload?.purpose !== "pin-oauth" || payload.uid !== String(user.id || "")) return back("bad-state");
  try {
    await pinterestConnect(sp.get("code") || "");
    const res = back("connected");
    res.cookies.delete("pin_oauth_state");
    return res;
  } catch (e) {
    console.error("[pinterest oauth callback]", e.message);
    return back("error&reason=" + encodeURIComponent(e.message.slice(0, 150)));
  }
}
