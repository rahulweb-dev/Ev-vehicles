import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";

// GET — list all active admin/dealer users for agent assignment dropdown
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const agents = await User.find({ isActive: true })
      .select("_id name role city")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ agents });
  } catch (e) {
    console.error("[GET /api/live-chat/agents]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
