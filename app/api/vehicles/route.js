import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vehicle from "@/lib/models/Vehicle";
import { requireAuth } from "@/lib/auth";

// GET /api/vehicles
// ?vehicleType=car|bike  &category=upcoming|popular  &status=published|draft
// &featured=true  &search=  &sort=launchDate|price|brand  &limit=  &page=
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const filter = {};
    const vehicleType = searchParams.get("vehicleType");
    const category    = searchParams.get("category");
    const status      = searchParams.get("status");
    const featured    = searchParams.get("featured");
    const search      = searchParams.get("search");
    const sort        = searchParams.get("sort") || "createdAt";
    const limit       = parseInt(searchParams.get("limit") || "50");
    const page        = parseInt(searchParams.get("page") || "1");

    if (vehicleType) filter.vehicleType = vehicleType;
    if (category)    filter.category    = category;
    if (status)      filter.status      = status;
    if (featured === "true") filter.featured = true;
    if (search)      filter.name = { $regex: search, $options: "i" };

    const sortMap = {
      launchDate: { launchDate: -1 },
      brand:      { brand: 1 },
      name:       { name: 1 },
      createdAt:  { createdAt: -1 },
    };
    const sortQuery = sortMap[sort] || { createdAt: -1 };

    const skip = (page - 1) * limit;
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort(sortQuery).skip(skip).limit(limit).lean(),
      Vehicle.countDocuments(filter),
    ]);

    return NextResponse.json({ vehicles, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[GET /api/vehicles]", error);
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

    const { name, brand, vehicleType, category, slug } = body;
    if (!name || !brand || !vehicleType || !category || !slug) {
      return NextResponse.json({ error: "name, brand, vehicleType, category and slug are required" }, { status: 400 });
    }

    const existing = await Vehicle.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const vehicle = await Vehicle.create(body);
    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/vehicles]", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
