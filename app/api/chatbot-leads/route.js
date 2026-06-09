import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatLead from "@/lib/models/ChatLead";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, city, interestedVehicle, vehicleType } = body;

    if (!name?.trim())  return NextResponse.json({ error: "Name is required" },  { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: "Phone is required" }, { status: 400 });

    await dbConnect();
    const lead = await ChatLead.create({
      name:              name.trim(),
      phone:             phone.trim(),
      email:             email?.trim()             || "",
      city:              city?.trim()              || "",
      interestedVehicle: interestedVehicle?.trim() || "",
      vehicleType:       vehicleType               || "any",
      status:            "new",
    });

    return NextResponse.json({ success: true, id: lead._id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/chatbot-leads]", err);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit  = parseInt(searchParams.get("limit") || "200");

    const filter = {};
    if (status) filter.status = status;

    const [leads, total] = await Promise.all([
      ChatLead.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      ChatLead.countDocuments(filter),
    ]);

    return NextResponse.json({ leads, total });
  } catch (err) {
    console.error("[GET /api/chatbot-leads]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
