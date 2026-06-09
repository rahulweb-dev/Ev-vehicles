import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatLead from "@/lib/models/ChatLead";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body   = await request.json();
    await dbConnect();
    const lead = await ChatLead.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error("[PATCH /api/chatbot-leads/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
