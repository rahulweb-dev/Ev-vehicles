import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import SocialPost from "@/lib/models/SocialPost";
import { publishSocialPost } from "@/lib/social/socialPosts";

export const maxDuration = 60;

async function load(params, user) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return null;
  return SocialPost.findOne({ _id: id, owner: user.id });
}

// POST — publish now (also retries failed accounts)
export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await dbConnect();
  const post = await load(params, auth.user);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = await publishSocialPost(post);
  if (!r) return NextResponse.json({ error: "This post is already being published or was published" }, { status: 409 });
  return NextResponse.json({ success: true, result: r });
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await dbConnect();
  const post = await load(params, auth.user);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.status === "publishing") return NextResponse.json({ error: "Publishing in progress" }, { status: 409 });
  await post.deleteOne();
  return NextResponse.json({ success: true });
}
