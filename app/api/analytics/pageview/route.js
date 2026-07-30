import { NextResponse } from "next/server";
import dbConnect  from "@/lib/mongodb";
import PageView   from "@/lib/models/PageView";

export async function POST(request) {
  try {
    const { path, title, referrer, sessionId, device, utm } = await request.json();
    if (!path || !sessionId) return NextResponse.json({ ok: false });

    await dbConnect();

    // One view per session + path per 30 minutes
    const since  = new Date(Date.now() - 30 * 60 * 1000);
    const exists = await PageView.exists({ sessionId, path, createdAt: { $gte: since } });
    if (!exists) {
      await PageView.create({
        path:      path.slice(0, 500),
        title:     (title     || "").slice(0, 300),
        referrer:  (referrer  || "").slice(0, 200),
        sessionId,
        device:    device || "desktop",
        utm:       utm || {},
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
