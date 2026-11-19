import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import SocialPost from "@/lib/models/SocialPost";
import { publishSocialPost } from "@/lib/social/socialPosts";
import { getMetaConfig } from "@/lib/social/meta";

export const maxDuration = 60;

const isAdmin = async () => { const u = await getAuthUser(); return u && u.role === "admin"; };

// GET /api/admin/social-posts?status=scheduled|published|failed|all
export async function GET(request) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status") || "all";
  const q = status === "all" ? {} : status === "failed" ? { status: { $in: ["failed", "partial"] } } : { status };
  const [posts, cfg] = await Promise.all([
    SocialPost.find(q).sort({ scheduledAt: -1, createdAt: -1 }).limit(200).lean(),
    getMetaConfig(),
  ]);
  return NextResponse.json({
    posts,
    connected: { facebook: !!(cfg.pageToken && cfg.pageId && cfg.facebook.enabled), instagram: !!(cfg.ig.token && cfg.igUserId && cfg.instagram.enabled) },
  });
}

// POST { platforms[], message, igCaption?, link?, imageUrl?, scheduledAt? (ISO) | publishNow: true }
export async function POST(request) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await request.json();
  const platforms = (b.platforms || []).filter((p) => ["facebook", "instagram"].includes(p));
  if (!platforms.length) return NextResponse.json({ error: "Choose Facebook and/or Instagram" }, { status: 400 });
  if (!String(b.message || "").trim() && !b.imageUrl) return NextResponse.json({ error: "Write a message or add an image" }, { status: 400 });
  if (platforms.includes("instagram") && !b.imageUrl) return NextResponse.json({ error: "Instagram posts need an image" }, { status: 400 });
  const when = b.publishNow ? new Date() : b.scheduledAt ? new Date(b.scheduledAt) : null;
  if (!when || Number.isNaN(when.getTime())) return NextResponse.json({ error: "Pick a date and time, or Publish now" }, { status: 400 });

  const post = await SocialPost.create({
    platforms, message: String(b.message || "").slice(0, 5000), igCaption: String(b.igCaption || "").slice(0, 2200),
    link: String(b.link || "").slice(0, 500), imageUrl: String(b.imageUrl || "").slice(0, 1000),
    scheduledAt: when, status: "scheduled", source: { kind: "manual" },
  });
  if (b.publishNow) {
    const r = await publishSocialPost(post);
    return NextResponse.json({ success: true, post: await SocialPost.findById(post._id).lean(), result: r }, { status: 201 });
  }
  return NextResponse.json({ success: true, post }, { status: 201 });
}
