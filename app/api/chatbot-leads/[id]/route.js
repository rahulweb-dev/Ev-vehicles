import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatLead from "@/lib/models/ChatLead";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body   = await request.json();
    const { status, notes } = body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (notes  !== undefined) update.notes  = notes;
    await dbConnect();
    const lead = await ChatLead.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error("[PATCH /api/chatbot-leads/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await dbConnect();
    await ChatLead.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/chatbot-leads/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
