import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import EVSale from "@/lib/models/EVSale";

// Accepts JSON array of sales records for bulk import
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { records } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "records array required" }, { status: 400 });
    }

    let inserted = 0, updated = 0, errors = [];

    for (const r of records) {
      try {
        const slug = (r.brandSlug || r.brand?.toLowerCase().replace(/\s+/g, "-")) ?? "";
        await EVSale.findOneAndUpdate(
          { brandSlug: slug, segment: r.segment, month: r.month, year: r.year, state: r.state || "National" },
          { ...r, brandSlug: slug },
          { upsert: true, new: true }
        );
        inserted++;
      } catch (e) {
        if (e.code === 11000) updated++;
        else errors.push({ record: r, error: e.message });
      }
    }

    return NextResponse.json({ inserted, updated, errors, total: records.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
