import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser, verifyToken } from "@/lib/auth";
import { encrypt } from "@/lib/encrypt";
import { getAppCreds, exchangeCode, listPages, SITE_URL } from "@/lib/social/metaAuth";

// GET /api/admin/social/meta/callback?code=..&state=.. — Facebook redirects here after login
export async function GET(request) {
  const back = (q) => NextResponse.redirect(`${SITE_URL}/admin/social-settings?meta=${q}`);
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return NextResponse.redirect(`${SITE_URL}/admin/login`);

  const sp = new URL(request.url).searchParams;
  if (sp.get("error")) return back("denied");
  const state = sp.get("state") || "";
  const jar = await cookies();
  const cookieState = jar.get("meta_oauth_state")?.value;
  const payload = verifyToken(state);
  if (!state || state !== cookieState || payload?.purpose !== "meta-oauth") return back("bad-state");

  try {
    const creds = await getAppCreds();
    const userToken = await exchangeCode(sp.get("code"), creds);
    const pages = await listPages(userToken);
    const dbConnect = (await import("@/lib/mongodb")).default;
    const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
    await dbConnect();
    const fb = await SocialSettings.findOne({ platform: "facebook" });
    await SocialSettings.findOneAndUpdate({ platform: "facebook" },
      { $set: { credentials: { ...(fb?.credentials?.toObject?.() || {}), userToken: encrypt(userToken) } } }, { upsert: true });
    const res = back(pages.length ? "choose-page" : "no-pages");
    res.cookies.delete("meta_oauth_state");
    return res;
  } catch (e) {
    console.error("[meta oauth callback]", e.message);
    return back("error&reason=" + encodeURIComponent(e.message.slice(0, 150)));
  }
}
