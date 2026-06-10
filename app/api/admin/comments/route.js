import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";
import { requireAuth } from "@/lib/auth";

// GET /api/admin/comments?status=pending|approved|all&search=&slug=&page=&limit=
export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status  = searchParams.get("status") || "all";   // all | pending | approved
    const search  = searchParams.get("search") || "";
    const slug    = searchParams.get("slug")   || "";
    const limit   = parseInt(searchParams.get("limit") || "30");
    const page    = parseInt(searchParams.get("page")  || "1");
    const skip    = (page - 1) * limit;

    const filter = {};
    if (status === "pending")  filter.approved = false;
    if (status === "approved") filter.approved = true;
    if (slug)   filter.articleSlug = slug;
    if (search) filter.$or = [
      { name:    { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { articleSlug: { $regex: search, $options: "i" } },
    ];

    const [comments, total, pendingCount] = await Promise.all([
      Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Comment.countDocuments(filter),
      Comment.countDocuments({ approved: false }),
    ]);

    return NextResponse.json({ comments, total, pendingCount, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[GET /api/admin/comments]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
