import { NextResponse }       from "next/server";
import dbConnect              from "@/lib/mongodb";
import Article                from "@/lib/models/Article";
import { requireAuth }        from "@/lib/auth";
import { publishToSocial }    from "@/lib/social/publisher";

// POST /api/admin/social-publish/[id]
// Body: { targets?: string[] }   — omit targets to retry all failed platforms
export async function POST(request, context) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;
    const body   = await request.json().catch(() => ({}));

    await dbConnect();

    const article = await Article.findById(id).lean();
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    if (article.status !== "published") {
      return NextResponse.json({ error: "Article must be published before posting to social media" }, { status: 400 });
    }

    // If no explicit targets, retry the platforms that previously failed (or all socialTargets)
    let targets = body.targets ?? [];
    if (targets.length === 0) {
      const ss  = article.socialStatus ?? {};
      const all = article.socialTargets?.length > 0 ? article.socialTargets : ["facebook", "linkedin", "pinterest", "telegram"];
      // Retry only failed / unpublished platforms
      targets = all.filter((p) => !ss[p]?.published);
    }

    const results = await publishToSocial(id, targets);

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[POST social-publish]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
