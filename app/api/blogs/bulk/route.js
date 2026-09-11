import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { action, ids } = await request.json();
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json({ error: "ids required" }, { status: 400 });
    }

    if (action === "delete") {
      await Blog.deleteMany({ _id: { $in: ids } });
    } else if (action === "publish") {
      await Blog.updateMany(
        { _id: { $in: ids }, publishedAt: { $exists: false } },
        { $set: { publishedAt: new Date() } }
      );
      await Blog.updateMany({ _id: { $in: ids } }, { $set: { status: "published" } });
    } else if (action === "unpublish") {
      await Blog.updateMany({ _id: { $in: ids } }, { $set: { status: "draft" } });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    revalidatePath("/blogs");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/blogs/bulk]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
