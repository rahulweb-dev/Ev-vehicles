import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import { requireAuth } from "@/lib/auth";
import { sendBlogPublishedEmail } from "@/lib/notifications";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status");
    const category = searchParams.get("category");
    const search   = searchParams.get("search");
    const limit    = parseInt(searchParams.get("limit") || "50");
    const page     = parseInt(searchParams.get("page")  || "1");

    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (search)   filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];

    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(filter),
    ]);
    return NextResponse.json({ blogs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/blogs]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const body = await request.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }
    const existing = await Blog.findOne({ slug: body.slug });
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

    const blog = await Blog.create(body);
    if (blog.status === "published") {
      revalidatePath("/blogs");
      revalidatePath(`/blogs/${blog.slug}`);
      sendBlogPublishedEmail(blog).catch(console.error);
    }
    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/blogs]", err);
    if (err.code === 11000) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
