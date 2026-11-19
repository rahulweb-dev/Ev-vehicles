import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { getMetaConfig, graph } from "@/lib/social/meta";
import SocialEvent from "@/lib/models/SocialEvent";

export const maxDuration = 30;

const isAdmin = async () => { const u = await getAuthUser(); return u && u.role === "admin"; };

// Each section is fetched independently so a missing permission only empties that section.
async function section(fn) {
  try { return { items: await fn(), error: "" }; } catch (e) { return { items: [], error: e.message }; }
}

// GET /api/admin/social-inbox — Facebook & Instagram messages and recent comments
export async function GET() {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = await getMetaConfig();
  const hasFb = !!(cfg.pageToken && cfg.pageId);
  const hasIg = !!(cfg.igUserId && cfg.ig.token);
  if (!hasFb && !hasIg) return NextResponse.json({ error: "Connect Facebook or Instagram in Admin → Social Settings first", sections: {} });
  const t = cfg.pageToken;
  const igOpts = { token: cfg.ig.token, base: cfg.ig.base };
  // Instagram DMs: via the linked Page, or directly on the Instagram account with Instagram Login
  const igLogin = cfg.ig.mode === "instagram-login";
  const igConvPath = igLogin ? "me/conversations" : `${cfg.pageId}/conversations`;
  const noFb = { items: [], error: "Facebook not connected" };
  const convFields = "id,updated_time,unread_count,participants,messages.limit(15){id,message,from,created_time}";
  const mapConv = (platform) => (c) => {
    const msgs = (c.messages?.data || []).slice().reverse();
    const customer = (c.participants?.data || c.participants || []).find((p) => p.id !== cfg.pageId && p.id !== cfg.igUserId) || {};
    return { id: c.id, platform, updatedAt: c.updated_time, unread: c.unread_count || 0, customer: { id: customer.id, name: customer.name || customer.username || "Customer" },
      messages: msgs.map((m) => ({ id: m.id, text: m.message || "", fromMe: m.from?.id === cfg.pageId || m.from?.id === cfg.igUserId, at: m.created_time })) };
  };

  const [fbMessages, igMessages, fbComments, igComments] = await Promise.all([
    hasFb ? section(async () => (await graph(`${cfg.pageId}/conversations`, { token: t, params: { fields: convFields, limit: 25 } })).data.map(mapConv("facebook"))) : noFb,
    hasIg
      ? section(async () => (await graph(igConvPath, { ...igOpts, params: { platform: "instagram", fields: igLogin ? convFields.replace("unread_count,", "") : convFields, limit: 25 } })).data.map(mapConv("instagram")))
      : { items: [], error: "Instagram not connected" },
    !hasFb ? noFb : section(async () => {
      const posts = (await graph(`${cfg.pageId}/posts`, { token: t, params: { fields: "id,message,permalink_url,created_time,comments.limit(25).order(reverse_chronological){id,message,from,created_time,comment_count}", limit: 10 } })).data;
      return posts.flatMap((p) => (p.comments?.data || []).map((c) => ({ id: c.id, platform: "facebook", text: c.message, author: c.from?.name || "Someone", fromMe: c.from?.id === cfg.pageId, at: c.created_time, replies: c.comment_count || 0,
        post: { id: p.id, text: (p.message || "").slice(0, 120), url: p.permalink_url } })));
    }),
    hasIg
      ? section(async () => {
        const media = (await graph(`${cfg.igUserId}/media`, { ...igOpts, params: { fields: "id,caption,permalink,timestamp,comments.limit(25){id,text,username,timestamp,replies{id}}", limit: 10 } })).data;
        return media.flatMap((m) => (m.comments?.data || []).map((c) => ({ id: c.id, platform: "instagram", text: c.text, author: c.username ? `@${c.username}` : "Someone", fromMe: false, at: c.timestamp, replies: c.replies?.data?.length || 0,
          post: { id: m.id, text: (m.caption || "").slice(0, 120), url: m.permalink } })));
      })
      : { items: [], error: "Instagram not connected" },
  ]);

  const byTime = (a, b) => new Date(b.updatedAt || b.at) - new Date(a.updatedAt || a.at);
  // Webhook events received since the inbox was last opened (then marked as seen)
  const newEvents = await SocialEvent.find({ read: false }).sort({ createdAt: -1 }).limit(50).lean();
  if (newEvents.length) await SocialEvent.updateMany({ _id: { $in: newEvents.map((e) => e._id) } }, { $set: { read: true } });
  return NextResponse.json({
    newEvents: newEvents.map((e) => ({ platform: e.platform, kind: e.kind, text: e.text, sender: e.senderName || "", at: e.at })),
    messages: [...fbMessages.items, ...igMessages.items].sort(byTime),
    comments: [...fbComments.items, ...igComments.items].filter((c) => !c.fromMe).sort(byTime),
    errors: { fbMessages: fbMessages.error, igMessages: igMessages.error, fbComments: fbComments.error, igComments: igComments.error },
  });
}

// POST { type: "message", platform, recipientId, text } | { type: "comment", platform, commentId, text }
export async function POST(request) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = await getMetaConfig();
  const b = await request.json();
  const text = String(b.text || "").trim().slice(0, 2000);
  if (!text) return NextResponse.json({ error: "Write a reply" }, { status: 400 });
  try {
    const igLogin = b.platform === "instagram" && cfg.ig.mode === "instagram-login";
    if (b.type === "message") {
      // DMs go through the Page's /messages endpoint, or the Instagram account's own endpoint with Instagram Login (24-hour window)
      const r = await graph(igLogin ? `${cfg.igUserId}/messages` : `${cfg.pageId}/messages`, { method: "POST", ...(igLogin ? { token: cfg.ig.token, base: cfg.ig.base } : { token: cfg.pageToken }), params: { recipient: { id: b.recipientId }, message: { text }, messaging_type: "RESPONSE" } });
      return NextResponse.json({ success: true, id: r.message_id });
    }
    if (b.type === "comment") {
      const path = b.platform === "instagram" ? `${b.commentId}/replies` : `${b.commentId}/comments`;
      const r = await graph(path, { method: "POST", ...(b.platform === "instagram" ? { token: cfg.ig.token, base: cfg.ig.base } : { token: cfg.pageToken }), params: { message: text } });
      return NextResponse.json({ success: true, id: r.id });
    }
    return NextResponse.json({ error: "Unknown reply type" }, { status: 400 });
  } catch (e) {
    const hint = /outside of allowed window|24/.test(e.message) ? " (Meta only allows replies within 24 hours of the customer's last message.)" : "";
    return NextResponse.json({ error: e.message + hint }, { status: 400 });
  }
}
