import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Brand from "@/lib/models/Brand";
import Vehicle from "@/lib/models/Vehicle";

export const dynamic = "force-dynamic";

/* GET /api/admin/brands
   Returns all Brand docs merged with unique brand names from Vehicle collection */
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await dbConnect();

  const [brands, vehicleBrands] = await Promise.all([
    Brand.find({}).sort({ name: 1 }).lean(),
    Vehicle.distinct("brand"),
  ]);

  /* Build a map of known brands by slug */
  const brandMap = new Map(brands.map(b => [b.slug, b]));

  /* Merge vehicle brands that don't have a Brand doc yet */
  const vehicleOnly = vehicleBrands
    .filter(Boolean)
    .map(name => {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      return brandMap.has(slug)
        ? null
        : { _id: null, name, slug, logo: "", website: "", description: "", category: "all", virtual: true };
    })
    .filter(Boolean);

  return NextResponse.json({ brands: [...brands, ...vehicleOnly] });
}

/* POST /api/admin/brands  — create a new brand entry */
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, slug, logo, website, description, category } = body;

  if (!name?.trim() || !slug?.trim())
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });

  await dbConnect();

  try {
    const brand = await Brand.create({ name: name.trim(), slug: slug.trim().toLowerCase(), logo, website, description, category });
    return NextResponse.json({ success: true, brand });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ error: "Brand with this name/slug already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
