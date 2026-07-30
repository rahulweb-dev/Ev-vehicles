import { NextResponse }    from "next/server";
import { requireAuth }     from "@/lib/auth";
import { revalidatePath }  from "next/cache";
import dbConnect           from "@/lib/mongodb";
import Article             from "@/lib/models/Article";

// POST /api/articles/bulk  { action: "publish"|"unpublish"|"delete", ids: string[] }
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { action, ids } = await request.json();
  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "action and ids[] required" }, { status: 400 });
  }

  await dbConnect();

  let result;
  if (action === "publish") {
    result = await Article.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "published" }, $setOnInsert: { publishedAt: new Date() } }
    );
    // Set publishedAt for drafts that don't have it yet
    await Article.updateMany(
      { _id: { $in: ids }, publishedAt: null },
      { $set: { publishedAt: new Date() } }
    );
  } else if (action === "unpublish") {
    result = await Article.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "draft" } }
    );
  } else if (action === "delete") {
    result = await Article.deleteMany({ _id: { $in: ids } });
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  revalidatePath("/news");
  revalidatePath("/");

  return NextResponse.json({
    success: true,
    action,
    affected: result.modifiedCount ?? result.deletedCount ?? ids.length,
  });
}
