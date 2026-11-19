import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth, verifyToken } from "@/lib/auth";
import { encrypt } from "@/lib/encrypt";
import { getAppCreds, exchangeCode, listPages, SITE_URL } from "@/lib/social/metaAuth";

export const maxDuration = 60;

// GET /api/admin/social/meta/callback?code=..&state=.. — Facebook redirects here after login.
// state.target "site" = the site's own Page (admin), "account" = the user's own Pages (My Social).
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const state = sp.get("state") || "";
  const payload = verifyToken(state);
  const forAccount = payload?.target === "account";
  const base = forAccount ? "/admin/my-social" : "/admin/social-settings";
  const back = (q) => NextResponse.redirect(`${SITE_URL}${base}?meta=${q}`);

  const user = (await requireAuth()).user;
  if (!user || (!forAccount && user.role !== "admin")) return NextResponse.redirect(`${SITE_URL}/admin/login`);
  if (sp.get("error")) return back("denied");
  const cookieState = (await cookies()).get("meta_oauth_state")?.value;
  if (!state || state !== cookieState || payload?.purpose !== "meta-oauth" || payload.uid !== String(user.id || "")) return back("bad-state");

  try {
    const creds = await getAppCreds();
    const userToken = await exchangeCode(sp.get("code"), creds);
    const dbConnect = (await import("@/lib/mongodb")).default;
    await dbConnect();
    let res;
    if (forAccount) {
      const { saveFacebookAccounts } = await import("@/lib/social/accounts");
      const saved = await saveFacebookAccounts(user.id, userToken);
      res = back(saved.length ? `connected&n=${saved.length}` : "no-pages");
    } else {
      const pages = await listPages(userToken);
      const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
      const fb = await SocialSettings.findOne({ platform: "facebook" });
      await SocialSettings.findOneAndUpdate({ platform: "facebook" },
        { $set: { credentials: { ...(fb?.credentials?.toObject?.() || {}), userToken: encrypt(userToken) } } }, { upsert: true });
      res = back(pages.length ? "choose-page" : "no-pages");
    }
    res.cookies.delete("meta_oauth_state");
    return res;
  } catch (e) {
    console.error("[meta oauth callback]", e.message);
    return back("error&reason=" + encodeURIComponent(e.message.slice(0, 150)));
  }
}
