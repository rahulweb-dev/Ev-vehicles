import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAppCreds, listPages, connectPage, getFacebookDoc, webhookVerifyToken, OAUTH_REDIRECT, WEBHOOK_URL } from "@/lib/social/metaAuth";

const isAdmin = async () => { const u = await getAuthUser(); return u && u.role === "admin"; };

// GET — connection status, the Pages available to connect, and the values to paste into the Meta app
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { appId, appSecret, userToken } = await getAppCreds();
  const fb = await getFacebookDoc();
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  const ig = await SocialSettings.findOne({ platform: "instagram" }).lean();
  let pages = [], pagesError = "";
  if (userToken) { try { pages = await listPages(userToken); } catch (e) { pagesError = e.message; } }
  return NextResponse.json({
    appConfigured: !!(appId && appSecret), loggedIn: !!userToken, pages, pagesError,
    connected: fb?.account ? { page: fb.account, instagram: ig?.account || null } : null,
    setup: { oauthRedirectUri: OAUTH_REDIRECT, webhookUrl: WEBHOOK_URL, webhookVerifyToken: webhookVerifyToken(appSecret) },
  });
}

// POST { pageId } — connect this Page (and its Instagram account) to the site
export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pageId } = await request.json();
  if (!/^\d+$/.test(String(pageId || ""))) return NextResponse.json({ error: "Choose a Page" }, { status: 400 });
  try { return NextResponse.json({ success: true, ...(await connectPage(pageId)) }); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
