import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vehicle from "@/lib/models/Vehicle";
import { requireAuth } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const revalidate = 60;

// GET /api/vehicles
// ?vehicleType=car|bike  &category=upcoming|popular  &status=published|draft
// &featured=true  &search=  &sort=launchDate|price|brand  &limit=  &page=
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const filter = {};
    const vehicleType    = searchParams.get("vehicleType");
    const category       = searchParams.get("category");
    const status         = searchParams.get("status");
    const featured       = searchParams.get("featured");
    const availability   = searchParams.get("availability");
    const search         = searchParams.get("search");
    const brand          = searchParams.get("brand");
    const sort           = searchParams.get("sort") || "createdAt";
    const limit          = parseInt(searchParams.get("limit") || "50");
    const page           = parseInt(searchParams.get("page") || "1");

    if (vehicleType)          filter.vehicleType  = vehicleType;
    if (category)             filter.category     = category;
    if (status)               filter.status       = status;
    if (featured === "true")  filter.featured     = true;
    if (availability)         filter.availability = availability;
    if (brand)                filter.brand        = { $regex: brand, $options: "i" };
    if (search)               filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];

    const sortMap = {
      launchDate: { launchDate: -1 },
      brand:      { brand: 1 },
      name:       { name: 1 },
      createdAt:  { createdAt: -1 },
    };
    const sortQuery = sortMap[sort] || { createdAt: -1 };

    const skip = (page - 1) * limit;
    // Select only fields needed for listing — omit description, gallery, specs, colors, faqs
    const LIST_FIELDS = "name brand slug vehicleType featuredImage variants performance charging " +
      "category availability status featured views launchDate createdAt updatedAt shortDescription " +
      "keyFeatures pros cons priceHistory";
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).select(LIST_FIELDS).sort(sortQuery).skip(skip).limit(limit).lean(),
      Vehicle.countDocuments(filter),
    ]);

    return NextResponse.json({ vehicles, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    logError("GET /api/vehicles", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/vehicles — admin only
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const body = await request.json();

    const { name, brand, vehicleType, slug } = body;
    if (!name || !brand || !vehicleType || !slug) {
      return NextResponse.json({ error: "name, brand, vehicleType and slug are required" }, { status: 400 });
    }

    // Sanitize enums before saving
    if (!["car", "bike", "commercial"].includes(body.vehicleType)) {
      return NextResponse.json({ error: "Invalid vehicleType" }, { status: 400 });
    }
    if (!["upcoming", "popular"].includes(body.category)) {
      body.category = "popular";
    }
    if (!["upcoming", "available", "discontinued"].includes(body.availability)) {
      body.availability = "available";
    }

    const existing = await Vehicle.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const vehicle = await Vehicle.create(body);
    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error) {
    logError("POST /api/vehicles", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
