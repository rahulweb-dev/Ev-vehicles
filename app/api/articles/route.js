import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/lib/models/Article";
import { requireAuth } from "@/lib/auth";
import { pingIndexNow, buildArticleUrl } from "@/lib/indexnow";
import { sendPushToAll } from "@/lib/pushNotify";

// GET /api/articles — public, supports ?category=&status=&featured=&limit=&page=
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const filter = {};
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "published";
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    if (category) filter.category = category;
    filter.status = status;
    if (featured === "true") filter.featured = true;

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      Article.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
      Article.countDocuments(filter),
    ]);

    return NextResponse.json({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[GET /api/articles]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/articles — admin only
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const body = await request.json();

    const {
      title, slug, excerpt, content, image, imageAlt,
      category, author, tags, readTime, featured, status,
      metaTitle, metaDescription,
    } = body;

    if (!title || !slug || !excerpt || !content || !image || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await Article.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const article = await Article.create({
      title, slug, excerpt, content, image,
      imageAlt: imageAlt || title,
      category, author: author || "EV News India Team",
      tags: tags || [],
      readTime: readTime || "5 min",
      featured: featured || false,
      status: status || "draft",
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      publishedAt: status === "published" ? new Date() : undefined,
    });

    // Ping search engines and push browser notifications when publishing
    if (status === "published") {
      pingIndexNow(buildArticleUrl(slug)).catch(console.error);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evnewsindia.com";
      sendPushToAll({
        title: "EV News India – New Article",
        body: title,
        icon: "/images/logo.png",
        image: image || undefined,
        url: `${siteUrl}/news/${slug}`,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/articles]", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
