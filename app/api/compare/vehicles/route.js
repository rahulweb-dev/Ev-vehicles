import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vehicle from "@/lib/models/Vehicle";

// ISR: popular/featured vehicles don't change more than once every 2 minutes
export const revalidate = 120;

/**
 * GET /api/compare/vehicles
 *
 * Query params:
 *   ?q=QUERY      — search by name / brand (top 10 published)
 *   ?popular=1    — 6 most popular / featured published vehicles
 *   ?type=car|bike — filter by vehicleType (optional, works with both q and popular)
 *
 * Response shape:
 *   { vehicles: Array<{ _id, slug, name, brand, featuredImage, vehicleType,
 *                        price, range }> }
 */

const PROJECTION = {
  slug: 1,
  name: 1,
  brand: 1,
  featuredImage: 1,
  vehicleType: 1,
  featured: 1,
  views: 1,
  "variants.exShowroomPrice": 1,
  "performance.drivingRange": 1,
};

function shape(v) {
  return {
    _id:          String(v._id),
    slug:         v.slug,
    name:         v.name,
    brand:        v.brand,
    featuredImage: v.featuredImage || "",
    vehicleType:  v.vehicleType,
    price:        v.variants?.[0]?.exShowroomPrice || "Price TBA",
    range:        v.performance?.drivingRange || "—",
  };
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q       = searchParams.get("q")?.trim();
    const popular = searchParams.get("popular");
    const type    = searchParams.get("type"); // "car" | "bike" | null

    const baseFilter = { status: "published" };
    if (type && ["car", "bike", "commercial"].includes(type)) {
      baseFilter.vehicleType = type;
    }

    /* ── Popular: featured first, then highest views ── */
    if (popular === "1") {
      const vehicles = await Vehicle.find(baseFilter)
        .select(PROJECTION)
        .sort({ featured: -1, views: -1, createdAt: -1 })
        .limit(6)
        .lean();

      return NextResponse.json(
        { vehicles: vehicles.map(shape) },
        { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
      );
    }

    /* ── Search ── */
    if (q) {
      const filter = {
        ...baseFilter,
        $or: [
          { name:  { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
        ],
      };

      const vehicles = await Vehicle.find(filter)
        .select(PROJECTION)
        .sort({ featured: -1, views: -1 })
        .limit(10)
        .lean();

      // Search results vary per query — shorter cache window
      return NextResponse.json(
        { vehicles: vehicles.map(shape) },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
      );
    }

    /* ── Default: return 6 featured/popular (same as popular=1) ── */
    const vehicles = await Vehicle.find(baseFilter)
      .select(PROJECTION)
      .sort({ featured: -1, views: -1, createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json(
      { vehicles: vehicles.map(shape) },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("[GET /api/compare/vehicles]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
