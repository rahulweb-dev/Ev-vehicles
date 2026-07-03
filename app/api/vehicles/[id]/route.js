import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vehicle from "@/lib/models/Vehicle";
import { requireAuth } from "@/lib/auth";
import { pingIndexNow, buildVehicleUrl } from "@/lib/indexnow";

// GET /api/vehicles/:id
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const vehicle = await Vehicle.findById(id).lean();
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("[GET /api/vehicles/:id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/vehicles/:id — admin only
export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Prevent slug collision
    if (body.slug) {
      const conflict = await Vehicle.findOne({ slug: body.slug, _id: { $ne: id } });
      if (conflict) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const existing = await Vehicle.findById(id).lean();
    const isPublishingNow = existing?.status !== "published" && body.status === "published";

    const vehicle = await Vehicle.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true }).lean();
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (isPublishingNow || existing?.status === "published") {
      pingIndexNow(buildVehicleUrl(vehicle.slug, vehicle.vehicleType)).catch(console.error);
    }

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("[PATCH /api/vehicles/:id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/vehicles/:id — admin only
export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/vehicles/:id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
