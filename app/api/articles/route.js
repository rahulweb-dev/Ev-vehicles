import { NextResponse }      from "next/server";
import { revalidatePath }     from "next/cache";
import dbConnect              from "@/lib/mongodb";
import { sanitizeArticleContent } from "@/lib/sanitize";

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const revalidate = 60; // cache article list for 60s — revalidated on publish/delete
import Article                from "@/lib/models/Article";
import { requireAuth }        from "@/lib/auth";
import { pingIndexNow, buildArticleUrl } from "@/lib/indexnow";
import { sendPushToAll }      from "@/lib/pushNotify";
import { publishToSocial }    from "@/lib/social/publisher";

// GET /api/articles — public, supports ?category=&status=&featured=&limit=&page=
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const category  = searchParams.get("category");
    const rawStatus = searchParams.get("status") || "published";
    const featured  = searchParams.get("featured");
    const search    = searchParams.get("search");
    const limit     = parseInt(searchParams.get("limit") || "20");
    const page      = parseInt(searchParams.get("page")  || "1");

    // Only authenticate when the caller explicitly requests non-published articles.
    // Public reads (status=published, the default) skip the cookie read + JWT verify
    // entirely, making the response cacheable at the CDN layer and restoring the
    // effectiveness of `export const revalidate = 60` above.
    let status = "published";
    let isPublicRead = true;
    if (rawStatus !== "published") {
      const isAdmin = !!(await (await import("@/lib/auth")).getAuthUser());
      status = isAdmin ? rawStatus : "published";
      isPublicRead = false;
    }

    const filter = {};
    if (category) filter.category = category;
    filter.status = status;
    if (featured === "true") filter.featured = true;
    if (search) {
      const safe = escapeRegExp(search);
      filter.$or = [
        { title:   { $regex: safe, $options: "i" } },
        { excerpt: { $regex: safe, $options: "i" } },
        { tags:    { $elemMatch: { $regex: safe, $options: "i" } } },
      ];
    }

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .select("-content") // content only needed on detail page — saves ~10× bandwidth on lists
        .sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
      Article.countDocuments(filter),
    ]);

    // Public reads are identical for all users — safe to cache at the CDN edge.
    // Admin reads (drafts etc.) must not be cached to prevent data leaks.
    const cacheHeader = isPublicRead
      ? "public, s-maxage=60, stale-while-revalidate=300"
      : "private, no-store";

    return NextResponse.json(
      { articles, total, page, pages: Math.ceil(total / limit) },
      { headers: { "Cache-Control": cacheHeader } }
    );
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
      metaTitle, metaDescription, metaKeywords,
      socialTargets,
    } = body;

    if (!title || !slug || !excerpt || !content || !image || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await Article.findOne({ slug });
    // Sanitize content before storing
    const safeContent = sanitizeArticleContent(content);
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const targets = Array.isArray(socialTargets) ? socialTargets : [];

    const article = await Article.create({
      title, slug, excerpt, content: safeContent, image,
      imageAlt: imageAlt || title,
      category, author: author || "EV Radar Team",
      tags: tags || [],
      readTime: readTime || "5 min",
      featured: featured || false,
      status: status || "draft",
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      metaKeywords: metaKeywords || "",
      publishedAt: status === "published" ? new Date() : undefined,
      socialTargets: targets,
    });

    // Bust ISR cache and notify search engines on publish
    if (status === "published") {
      revalidatePath("/");
      revalidatePath("/news");
      revalidatePath(`/news/${slug}`);
      revalidatePath(`/news/category/${category}`);
      pingIndexNow(buildArticleUrl(slug)).catch(console.error);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in/";
      sendPushToAll({
        title: "EV Radar – New Article",
        body:  title,
        icon:  "/images/logo.png",
        image: image || undefined,
        url:   `${siteUrl}/news/${slug}`,
      }).catch(console.error);
      if (targets.length > 0) {
        publishToSocial(String(article._id), targets).catch(console.error);
      }
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
