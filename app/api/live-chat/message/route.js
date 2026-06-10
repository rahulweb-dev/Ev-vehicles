import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LiveChatSession from "@/lib/models/LiveChatSession";
import { getPusherServer } from "@/lib/pusher";

// POST — send a message (user or agent)
export async function POST(req) {
  try {
    await dbConnect();
    const { sessionId, role, content, senderName } = await req.json();

    if (!sessionId || !role || !content?.trim()) {
      return NextResponse.json({ error: "sessionId, role, content required" }, { status: 400 });
    }

    const msg = { role, content: content.trim(), senderName: senderName || "" };

    const update = {
      $push: { messages: msg },
      lastMessageAt: new Date(),
    };
    // First agent message activates the session
    if (role === "agent") update.status = "active";

    const session = await LiveChatSession.findOneAndUpdate(
      { sessionId },
      update,
      { new: true }
    );
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const pusher = getPusherServer();
    const saved  = session.messages.at(-1);

    // Push message to the user's chat window
    await pusher.trigger(`live-chat-${sessionId}`, "new-message", {
      role,
      content:    saved.content,
      senderName: saved.senderName,
      timestamp:  saved.createdAt,
    });

    // If user sent a message, ping admin panel with an unread badge update
    if (role === "user") {
      await pusher.trigger("admin-notifications", "user-message", {
        sessionId,
        userName:  session.userName,
        content:   saved.content,
        timestamp: saved.createdAt,
      });
    }

    // First agent message → fire agent-joined so user sees the "connected" banner
    if (role === "agent") {
      const agentMsgs = session.messages.filter(m => m.role === "agent");
      if (agentMsgs.length === 1) {
        await pusher.trigger(`live-chat-${sessionId}`, "agent-joined", {
          agentName: senderName || "EV Expert",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[POST /api/live-chat/message]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
