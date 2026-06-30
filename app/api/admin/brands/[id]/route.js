import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Brand from "@/lib/models/Brand";

export const dynamic = "force-dynamic";

/* PUT /api/admin/brands/:id — update logo, website, description */
export async function PUT(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  await dbConnect();

  const allowed = ["logo", "website", "description", "category", "name"];
  const update  = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const brand = await Brand.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  return NextResponse.json({ success: true, brand });
}

/* DELETE /api/admin/brands/:id */
export async function DELETE(_, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await dbConnect();

  await Brand.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
