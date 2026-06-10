import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LiveChatSession from "@/lib/models/LiveChatSession";
import { requireAuth } from "@/lib/auth";
import { getPusherServer } from "@/lib/pusher";

// PATCH — admin updates status / assigns agent
export async function PATCH(req, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const update = {};
    if (body.status          !== undefined) update.status          = body.status;
    if (body.assignedToId    !== undefined) update.assignedToId    = body.assignedToId;
    if (body.assignedToName  !== undefined) update.assignedToName  = body.assignedToName;

    const session = await LiveChatSession.findByIdAndUpdate(id, update, { new: true });
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Tell user side about the update (status change, agent assigned)
    await getPusherServer().trigger(`live-chat-${session.sessionId}`, "session-updated", {
      status:         session.status,
      assignedToName: session.assignedToName,
    });

    return NextResponse.json({ session });
  } catch (e) {
    console.error("[PATCH /api/live-chat/session/[id]]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — admin removes session
export async function DELETE(req, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id } = await params;
    await LiveChatSession.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/live-chat/session/[id]]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
