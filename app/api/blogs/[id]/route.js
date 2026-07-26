import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import { requireAuth } from "@/lib/auth";
import { pingIndexNow, buildBlogUrl } from "@/lib/indexnow";
import { sendBlogPublishedEmail } from "@/lib/notifications";

export async function GET(_, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const blog = await Blog.findById(id).lean();
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const existing = await Blog.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isPublishingNow = existing.status !== "published" && body.status === "published";
    if (isPublishingNow && !body.publishedAt) body.publishedAt = new Date();

    const blog = await Blog.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (isPublishingNow || existing.status === "published") {
      pingIndexNow(buildBlogUrl(blog.slug)).catch(console.error);
      revalidatePath("/blogs");
      revalidatePath(`/blogs/${blog.slug}`);
    }

    if (isPublishingNow) {
      sendBlogPublishedEmail(blog).catch(console.error);
    }

    return NextResponse.json({ success: true, blog });
  } catch (err) {
    console.error("[PATCH /api/blogs/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
