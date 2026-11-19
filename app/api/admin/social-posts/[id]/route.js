import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import SocialPost from "@/lib/models/SocialPost";
import { publishSocialPost } from "@/lib/social/socialPosts";

export const maxDuration = 60;

const isAdmin = async () => { const u = await getAuthUser(); return u && u.role === "admin"; };

async function load(params) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return null;
  return SocialPost.findById(id);
}

// PATCH — edit a post that hasn't been published yet
export async function PATCH(request, { params }) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const post = await load(params);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (["published", "publishing"].includes(post.status)) return NextResponse.json({ error: "Already published" }, { status: 409 });
  const b = await request.json();
  for (const k of ["message", "igCaption", "link", "imageUrl"]) if (typeof b[k] === "string") post[k] = b[k];
  if (Array.isArray(b.platforms)) post.platforms = b.platforms.filter((p) => ["facebook", "instagram", "pinterest"].includes(p));
  if (b.scheduledAt) { post.scheduledAt = new Date(b.scheduledAt); post.status = "scheduled"; }
  await post.save();
  return NextResponse.json({ success: true, post });
}

// POST — publish now (also retries failed platforms)
export async function POST(request, { params }) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const post = await load(params);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = await publishSocialPost(post);
  if (!r) return NextResponse.json({ error: "This post is already being published or was published" }, { status: 409 });
  return NextResponse.json({ success: true, result: r });
}

export async function DELETE(request, { params }) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const post = await load(params);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.status === "publishing") return NextResponse.json({ error: "Publishing in progress" }, { status: 409 });
  await post.deleteOne();
  return NextResponse.json({ success: true });
}
