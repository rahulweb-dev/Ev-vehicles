import { NextResponse, after } from "next/server";
import dbConnect from "@/lib/mongodb";
import SocialEvent from "@/lib/models/SocialEvent";
import { getAppCreds, getFacebookDoc, validSignature, webhookVerifyToken, SITE_URL } from "@/lib/social/metaAuth";
import { getIgAppCreds, igWebhookVerifyToken } from "@/lib/social/instagramAuth";
import { decrypt } from "@/lib/encrypt";
import { sendMail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/sanitize";

// Meta webhook endpoint (Facebook Page "messages" + "feed", Instagram "messages" + "comments").
// GET = subscription verification; POST = events, verified with the App Secret signature.

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const [{ appSecret }, { igAppSecret }] = await Promise.all([getAppCreds(), getIgAppCreds()]);
  // Facebook product webhooks use the token from the App Secret; Instagram Login webhooks the one from the Instagram App Secret
  const accepted = [webhookVerifyToken(appSecret), igWebhookVerifyToken(igAppSecret)].filter(Boolean);
  if (sp.get("hub.mode") === "subscribe" && accepted.includes(sp.get("hub.verify_token"))) {
    return new NextResponse(sp.get("hub.challenge") || "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function parseEvents(body, ownIds) {
  const out = [];
  const platform = body.object === "instagram" ? "instagram" : "facebook";
  for (const entry of body.entry || []) {
    const acct = String(entry.id || "");
    for (const m of entry.messaging || []) {
      if (!m.message || m.message.is_echo || ownIds.has(m.sender?.id)) continue; // skip our own replies
      out.push({ accountExternalId: acct, platform, kind: "message", externalId: m.message.mid, senderId: m.sender?.id, text: m.message.text || (m.message.attachments ? "[attachment]" : ""), at: new Date(m.timestamp || Date.now()) });
    }
    for (const ch of entry.changes || []) {
      const v = ch.value || {};
      if (ch.field === "feed" && v.item === "comment" && v.verb === "add" && !ownIds.has(v.from?.id)) {
        out.push({ accountExternalId: acct, platform: "facebook", kind: "comment", externalId: v.comment_id, senderId: v.from?.id, senderName: v.from?.name, text: v.message || "", postId: v.post_id, at: new Date((v.created_time || Date.now() / 1000) * 1000) });
      }
      if (ch.field === "comments" && v.id && !ownIds.has(v.from?.id)) {
        out.push({ accountExternalId: acct, platform: "instagram", kind: "comment", externalId: v.id, senderId: v.from?.id, senderName: v.from?.username ? `@${v.from.username}` : "", text: v.text || "", postId: v.media?.id, at: new Date() });
      }
    }
  }
  return out.filter((e) => e.externalId);
}

export async function POST(request) {
  const raw = await request.text();
  const [{ appSecret }, { igAppSecret }] = await Promise.all([getAppCreds(), getIgAppCreds()]);
  const sig = request.headers.get("x-hub-signature-256");
  if (!validSignature(raw, sig, appSecret) && !validSignature(raw, sig, igAppSecret)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let body; try { body = JSON.parse(raw); } catch { return new NextResponse("Bad JSON", { status: 400 }); }

  await dbConnect();
  const fb = await getFacebookDoc();
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  const ig = await SocialSettings.findOne({ platform: "instagram" }).lean();
  const siteIds = [fb?.credentials?.pageId && decrypt(fb.credentials.pageId), ig?.credentials?.igUserId && decrypt(ig.credentials.igUserId)].filter(Boolean);
  // Users' own connected accounts (My Social) — route their events to them
  const SocialAccount = (await import("@/lib/models/SocialAccount")).default;
  const entryIds = [...new Set((body.entry || []).map((e) => String(e.id || "")).filter(Boolean))];
  const userAccounts = entryIds.length ? await SocialAccount.find({ externalId: { $in: entryIds } }).select("owner externalId name username").lean() : [];
  const ownIds = new Set([...siteIds, ...userAccounts.map((a) => a.externalId)]);

  const events = parseEvents(body, ownIds);
  const fresh = [];
  for (const e of events) {
    const isSite = siteIds.includes(e.accountExternalId);
    const ua = !isSite && userAccounts.find((a) => a.externalId === e.accountExternalId);
    if (ua) e.owner = ua.owner;
    const r = await SocialEvent.updateOne({ externalId: e.externalId }, { $setOnInsert: e }, { upsert: true });
    if (r.upsertedCount) fresh.push(e);
  }

  // Alerts for users' own accounts go to the account owner
  const forUsers = fresh.filter((e) => e.owner);
  if (forUsers.length) {
    after(async () => {
      try {
        const User = (await import("@/lib/models/User")).default;
        const byOwner = new Map();
        for (const e of forUsers) byOwner.set(String(e.owner), [...(byOwner.get(String(e.owner)) || []), e]);
        for (const [ownerId, list] of byOwner) {
          const u = await User.findById(ownerId).select("email isActive").lean();
          if (!u?.email || !u.isActive) continue;
          await sendMail({ to: u.email, subject: `💬 ${list.length} new message${list.length === 1 ? "" : "s"}/comment${list.length === 1 ? "" : "s"} on your social accounts`,
            html: `${list.map((e) => `<p><b>${e.platform === "instagram" ? "📸 Instagram" : "📘 Facebook"} ${e.kind}</b>${e.senderName ? ` from ${escapeHtml(e.senderName)}` : ""}:<br>${escapeHtml(e.text || "")}</p>`).join("")}<p><a href="${SITE_URL}/admin/my-social">Open My Social →</a></p>` });
        }
      } catch (err) { console.error("[meta webhook user email]", err?.message || err); }
    });
  }
  const siteFresh = fresh.filter((e) => !e.owner);
  if (siteFresh.length) {
    const fresh = siteFresh;
    after(async () => {
      try {
        const to = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "contact@evradar.in";
        const icon = (p) => (p === "instagram" ? "📸 Instagram" : "📘 Facebook");
        await sendMail({ to, subject: `💬 ${fresh.length} new ${fresh.length === 1 ? (fresh[0].kind === "message" ? "message" : "comment") : "messages/comments"} on ${icon(fresh[0].platform)}`,
          html: `${fresh.map((e) => `<p><b>${icon(e.platform)} ${e.kind}</b>${e.senderName ? ` from ${escapeHtml(e.senderName)}` : ""}:<br>${escapeHtml(e.text || "")}</p>`).join("")}<p><a href="${SITE_URL}/admin/social-inbox">Reply in Social Inbox →</a></p>` });
      } catch (err) { console.error("[meta webhook email]", err?.message || err); }
    });
  }
  // Always 200 quickly so Meta doesn't retry or disable the subscription
  return NextResponse.json({ received: events.length });
}
