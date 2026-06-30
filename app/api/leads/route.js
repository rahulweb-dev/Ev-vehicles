import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { getAuthUser } from "@/lib/auth";

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, city, state, vehicleName, vehicleSlug, vehicleType, intent } = body;

    if (!name || !phone || !vehicleName || !vehicleSlug) {
      return NextResponse.json({ error: "Name, phone, and vehicle are required" }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    await dbConnect();
    const lead = await Lead.create({
      name,
      phone: phone.replace(/\s/g, ""),
      email,
      city,
      state,
      vehicleName,
      vehicleSlug,
      vehicleType: vehicleType || "car",
      intent: intent || "general",
    });

    return NextResponse.json({ success: true, id: lead._id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json({ error: "Could not save enquiry" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const user = await getAuthUser();

    const { searchParams } = new URL(request.url);
    const vehicleSlug  = searchParams.get("vehicleSlug");
    const status       = searchParams.get("status");
    const vehicleType  = searchParams.get("vehicleType");
    const cityFilter   = searchParams.get("city");
    const stateFilter  = searchParams.get("state");
    const limit        = parseInt(searchParams.get("limit") || "200");

    const filter = {};

    // Dealers are auto-scoped to their city/state — they can't override this
    if (user && user.role === "dealer") {
      if (user.city)  filter.city  = { $regex: new RegExp(`^${escapeRegExp(user.city)}$`, "i") };
      if (user.state) filter.state = { $regex: new RegExp(`^${escapeRegExp(user.state)}$`, "i") };
    } else {
      // Admin can filter by city/state optionally
      if (cityFilter)  filter.city  = { $regex: new RegExp(escapeRegExp(cityFilter), "i") };
      if (stateFilter) filter.state = { $regex: new RegExp(escapeRegExp(stateFilter), "i") };
    }

    if (vehicleSlug)  filter.vehicleSlug  = vehicleSlug;
    if (status)       filter.status       = status;
    if (vehicleType)  filter.vehicleType  = vehicleType;

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    const total = await Lead.countDocuments(filter);
    return NextResponse.json({ leads, total });
  } catch (err) {
    console.error("[GET /api/leads]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
