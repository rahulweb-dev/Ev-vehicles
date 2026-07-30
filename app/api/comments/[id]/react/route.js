import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment   from "@/lib/models/Comment";

const ALLOWED = ["like", "love", "fire", "insight"];

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const type = body?.type;

  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  await dbConnect();

  const comment = await Comment.findByIdAndUpdate(
    id,
    { $inc: { [`reactions.${type}`]: 1 } },
    { new: true, select: "reactions" }
  );

  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ reactions: comment.reactions });
}
