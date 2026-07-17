import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import EVSale from "@/lib/models/EVSale";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const record = await EVSale.findById(params.id).lean();
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const body = await req.json();
    const record = await EVSale.findByIdAndUpdate(params.id, body, { new: true });
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    await EVSale.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
