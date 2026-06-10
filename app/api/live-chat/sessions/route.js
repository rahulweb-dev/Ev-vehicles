import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LiveChatSession from "@/lib/models/LiveChatSession";
import { requireAuth } from "@/lib/auth";

// GET — admin: list sessions (no messages payload, just metadata)
export async function GET(req) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const [sessions, total, waitingCount] = await Promise.all([
      LiveChatSession.find(filter)
        .sort({ lastMessageAt: -1 })
        .select("-messages")
        .lean(),
      LiveChatSession.countDocuments(filter),
      LiveChatSession.countDocuments({ status: "waiting" }),
    ]);

    return NextResponse.json({ sessions, total, waitingCount });
  } catch (e) {
    console.error("[GET /api/live-chat/sessions]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
