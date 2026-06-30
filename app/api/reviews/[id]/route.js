import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import VehicleReview from "@/lib/models/VehicleReview";
import { requireAuth } from "@/lib/auth";

// PATCH /api/reviews/[id] — admin: approve or reject
export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const { status } = await request.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
  }

  try {
    await dbConnect();
    const review = await VehicleReview.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[PATCH /api/reviews/[id]]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] — admin: hard delete
export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  try {
    await dbConnect();
    await VehicleReview.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/reviews/[id]]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
