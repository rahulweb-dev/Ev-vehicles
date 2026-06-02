import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const banner = await Banner.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("[PATCH /api/banners/:id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/banners/:id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
