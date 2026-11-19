import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getIgAppCreds, igMe, igSubscribeWebhooks, igWebhookVerifyToken, disconnectIg, IG_OAUTH_REDIRECT, WEBHOOK_URL } from "@/lib/social/instagramAuth";

const isAdmin = async () => { const u = await getAuthUser(); return u && u.role === "admin"; };

// GET — Instagram Login connection status + values to paste into the Meta app
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { igAppId, igAppSecret, igToken, account } = await getIgAppCreds();
  let tokenError = "";
  if (igToken && account?.mode === "instagram-login") { try { await igMe(igToken); } catch (e) { tokenError = e.message; } }
  return NextResponse.json({
    appConfigured: !!(igAppId && igAppSecret),
    connected: account?.mode === "instagram-login" ? { ...account, tokenError } : null,
    linkedViaFacebook: account && account.mode !== "instagram-login" ? account : null,
    setup: { redirectUri: IG_OAUTH_REDIRECT, webhookUrl: WEBHOOK_URL, webhookVerifyToken: igWebhookVerifyToken(igAppSecret) },
  });
}

// POST { action: "resubscribe" } — retry the webhook subscription
export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action } = await request.json().catch(() => ({}));
  const { igToken } = await getIgAppCreds();
  if (action !== "resubscribe" || !igToken) return NextResponse.json({ error: "Not connected" }, { status: 400 });
  const r = await igSubscribeWebhooks(igToken);
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await SocialSettings.updateOne({ platform: "instagram" }, { $set: { "account.webhookSubscribed": r.webhookSubscribed, "account.webhookError": r.webhookError } });
  return NextResponse.json(r);
}

// DELETE — disconnect Instagram
export async function DELETE() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await disconnectIg();
  return NextResponse.json({ success: true });
}
