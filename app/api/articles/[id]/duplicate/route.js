import { NextResponse }  from "next/server";
import { requireAuth }   from "@/lib/auth";
import dbConnect         from "@/lib/mongodb";
import Article           from "@/lib/models/Article";

// POST /api/articles/[id]/duplicate
export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  await dbConnect();

  const original = await Article.findById(id).lean();
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { _id, views, likes, publishedAt, scheduledAt, dateModified,
          socialStatus, createdAt, updatedAt, __v, ...rest } = original;

  const baseSlug = `${original.slug}-copy`;
  let slug = baseSlug;
  let n = 1;
  while (await Article.exists({ slug })) {
    slug = `${baseSlug}-${n++}`;
  }

  const copy = await Article.create({
    ...rest,
    title:  `${original.title} (Copy)`,
    slug,
    status: "draft",
    views:  0,
    likes:  0,
    featured: false,
    publishedAt:  null,
    scheduledAt:  null,
    dateModified: null,
  });

  return NextResponse.json({ success: true, article: copy }, { status: 201 });
}
