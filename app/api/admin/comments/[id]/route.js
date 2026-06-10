import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";
import { requireAuth } from "@/lib/auth";

// PATCH /api/admin/comments/[id] — approve or reject
export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    const { approved } = await request.json();

    const comment = await Comment.findByIdAndUpdate(
      id,
      { approved: !!approved },
      { new: true }
    );
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    return NextResponse.json({ comment });
  } catch (error) {
    console.error("[PATCH /api/admin/comments/[id]]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/comments/[id]
export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    await Comment.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/comments/[id]]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
