import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import EVSale from "@/lib/models/EVSale";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const segment  = searchParams.get("segment");
    const brand    = searchParams.get("brand");
    const year     = searchParams.get("year");
    const month    = searchParams.get("month");
    const state    = searchParams.get("state");
    const limit    = parseInt(searchParams.get("limit") || "100");
    const page     = parseInt(searchParams.get("page") || "1");

    const query = {};
    if (segment) query.segment = segment;
    if (brand)   query.brandSlug = brand;
    if (year)    query.year  = parseInt(year);
    if (month)   query.month = parseInt(month);
    if (state)   query.state = state;

    const [total, records] = await Promise.all([
      EVSale.countDocuments(query),
      EVSale.find(query)
        .sort({ year: -1, month: -1, unitsSold: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json(
      { records, total, page, pages: Math.ceil(total / limit) },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { brand, brandSlug, segment, month, year, unitsSold, marketShare, growthPercentage, state, isNational } = body;

    if (!brand || !segment || !month || !year || unitsSold === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = brandSlug || brand.toLowerCase().replace(/\s+/g, "-");
    const record = await EVSale.findOneAndUpdate(
      { brandSlug: slug, segment, month, year, state: state || "National" },
      { brand, brandSlug: slug, segment, month, year, unitsSold, marketShare: marketShare || 0, growthPercentage: growthPercentage || 0, state: state || "National", isNational: isNational ?? true },
      { upsert: true, new: true }
    );

    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
