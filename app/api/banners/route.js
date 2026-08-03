import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";
import { requireAuth } from "@/lib/auth";

// ISR: regenerate banner list at most every 5 minutes server-side
export const revalidate = 300;

// GET /api/banners — public
// ?status=active  &platform=desktop|mobile
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status");
    const platform = searchParams.get("platform");
    const filter   = {};
    if (status)   filter.status   = status;
    if (platform) filter.platform = platform;
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(
      { banners },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("[GET /api/banners]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/banners — admin only
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const body = await request.json();
    if (!body.title || !body.image) {
      return NextResponse.json({ error: "title and image are required" }, { status: 400 });
    }
    const banner = await Banner.create(body);
    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/banners]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
