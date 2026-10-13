import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import EVSale from "@/lib/models/EVSale";
import { requireAuth } from "@/lib/auth";

const EDITABLE = ["brand", "brandSlug", "segment", "month", "year", "unitsSold", "marketShare", "growthPercentage", "state", "isNational"];

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const record = await EVSale.findById((await params).id).lean();
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await dbConnect();
    const body = await req.json();
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => EDITABLE.includes(k)));
    const record = await EVSale.findByIdAndUpdate((await params).id, { $set: update }, { new: true, runValidators: true });
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await dbConnect();
    await EVSale.findByIdAndDelete((await params).id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
