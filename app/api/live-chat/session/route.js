import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import dbConnect from "@/lib/mongodb";
import LiveChatSession from "@/lib/models/LiveChatSession";
import { getPusherServer } from "@/lib/pusher";

// POST — user starts a live chat session
export async function POST(req) {
  try {
    await dbConnect();
    const { userName, userPhone, userCity, interestedVehicle } = await req.json();

    const sessionId = randomUUID();
    const session = await LiveChatSession.create({
      sessionId,
      userName:          userName?.trim()          || "Visitor",
      userPhone:         userPhone?.trim()         || "",
      userCity:          userCity?.trim()          || "",
      interestedVehicle: interestedVehicle?.trim() || "",
    });

    // Notify all admin panel subscribers
    await getPusherServer().trigger("admin-notifications", "new-session", {
      sessionId,
      _id:               session._id,
      userName:          session.userName,
      userPhone:         session.userPhone,
      userCity:          session.userCity,
      interestedVehicle: session.interestedVehicle,
      status:            "waiting",
      createdAt:         session.createdAt,
      lastMessageAt:     session.lastMessageAt,
    });

    return NextResponse.json({ sessionId, _id: session._id });
  } catch (e) {
    console.error("[POST /api/live-chat/session]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET — fetch full session (with messages) by ?sessionId=xxx
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const session = await LiveChatSession.findOne({ sessionId }).lean();
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ session });
  } catch (e) {
    console.error("[GET /api/live-chat/session]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
