import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vehicle from "@/lib/models/Vehicle";
import { requireAuth } from "@/lib/auth";
import { electricBikesSeed } from "@/data/electricBikesSeed";

/**
 * POST /api/admin/seed-bikes
 * Admin-only endpoint that upserts all 14 electric bikes into MongoDB.
 * Safe to run multiple times — updates existing records, inserts new ones.
 */
export async function POST() {
  const auth = await requireAuth();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();

    let inserted = 0;
    let updated  = 0;
    const errors = [];

    for (const bike of electricBikesSeed) {
      try {
        const existing = await Vehicle.findOne({ slug: bike.slug });
        if (existing) {
          await Vehicle.findOneAndUpdate({ slug: bike.slug }, { $set: bike }, { runValidators: false });
          updated++;
        } else {
          await Vehicle.create(bike);
          inserted++;
        }
      } catch (err) {
        errors.push({ slug: bike.slug, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seed complete: ${inserted} inserted, ${updated} updated, ${errors.length} errors.`,
      stats: { total: electricBikesSeed.length, inserted, updated, errors },
    });
  } catch (error) {
    console.error("[seed-bikes]", error);
    return NextResponse.json({ error: error.message || "Seed failed" }, { status: 500 });
  }
}

/** GET — quick status check (no auth needed) */
export async function GET() {
  try {
    await dbConnect();
    const slugs  = electricBikesSeed.map((b) => b.slug);
    const existing = await Vehicle.countDocuments({
      slug: { $in: slugs },
      vehicleType: "bike",
    });
    return NextResponse.json({
      totalInSeed: electricBikesSeed.length,
      alreadyInDB: existing,
      pendingInsert: electricBikesSeed.length - existing,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
