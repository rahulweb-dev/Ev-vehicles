import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { getAuthUser } from "@/lib/auth";

async function canAccessLead(user, lead) {
  if (!user) return false;
  if (user.role === "admin") return true;
  // Dealer: must match their city/state
  const cityMatch  = !user.city  || lead.city?.toLowerCase()  === user.city.toLowerCase();
  const stateMatch = !user.state || lead.state?.toLowerCase() === user.state.toLowerCase();
  return cityMatch && stateMatch;
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const lead = await Lead.findById(id).lean();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (!(await canAccessLead(user, lead))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const updated = await Lead.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    return NextResponse.json({ success: true, lead: updated });
  } catch (err) {
    console.error("[PATCH /api/leads/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    const { id } = await params;

    const lead = await Lead.findById(id).lean();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (!(await canAccessLead(user, lead))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/leads/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
