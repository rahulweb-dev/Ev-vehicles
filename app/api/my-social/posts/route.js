import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import SocialPost from "@/lib/models/SocialPost";
import SocialAccount from "@/lib/models/SocialAccount";
import { publishSocialPost } from "@/lib/social/socialPosts";

export const maxDuration = 60;

// GET — the logged-in user's own posts (My Social)
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await dbConnect();
  const posts = await SocialPost.find({ owner: auth.user.id }).sort({ scheduledAt: -1, createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ posts });
}

// POST { accountIds[], message, igCaption?, link?, imageUrl?, scheduledAt? | publishNow }
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await dbConnect();
  const b = await request.json();
  const ids = (b.accountIds || []).filter((id) => mongoose.isValidObjectId(id));
  const accounts = await SocialAccount.find({ _id: { $in: ids }, owner: auth.user.id }).lean();
  if (!accounts.length) return NextResponse.json({ error: "Choose at least one of your accounts" }, { status: 400 });
  const imageUrl = String(b.imageUrl || "").slice(0, 1000);
  if (!String(b.message || "").trim() && !imageUrl) return NextResponse.json({ error: "Write a message or add an image" }, { status: 400 });
  if (accounts.some((a) => a.platform === "instagram") && !imageUrl) return NextResponse.json({ error: "Instagram posts need an image" }, { status: 400 });
  if (imageUrl && !/^https:\/\//.test(imageUrl)) return NextResponse.json({ error: "Image must be an https URL" }, { status: 400 });
  const when = b.publishNow ? new Date() : b.scheduledAt ? new Date(b.scheduledAt) : null;
  if (!when || Number.isNaN(when.getTime())) return NextResponse.json({ error: "Pick a date and time, or Publish now" }, { status: 400 });

  const post = await SocialPost.create({
    owner: auth.user.id, accounts: accounts.map((a) => a._id), platforms: [...new Set(accounts.map((a) => a.platform))],
    message: String(b.message || "").slice(0, 5000), igCaption: String(b.igCaption || "").slice(0, 2200),
    link: String(b.link || "").slice(0, 500), imageUrl, scheduledAt: when, status: "scheduled", source: { kind: "user" },
  });
  if (b.publishNow) {
    const r = await publishSocialPost(post);
    return NextResponse.json({ success: true, post: await SocialPost.findById(post._id).lean(), result: r }, { status: 201 });
  }
  return NextResponse.json({ success: true, post }, { status: 201 });
}
