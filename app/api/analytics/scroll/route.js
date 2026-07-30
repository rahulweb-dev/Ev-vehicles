import { NextResponse } from "next/server";
import dbConnect  from "@/lib/mongodb";
import PageView   from "@/lib/models/PageView";

// POST /api/analytics/scroll  { path, sessionId, depth }
// Records the maximum scroll depth reached for a session on a page.
export async function POST(request) {
  try {
    const { path, sessionId, depth } = await request.json();
    if (!path || !sessionId || !depth) return NextResponse.json({ ok: false });

    await dbConnect();
    // Update the most recent pageview for this session+path to record max scroll depth
    await PageView.findOneAndUpdate(
      { sessionId, path },
      { $max: { scrollDepth: depth } },
      { sort: { createdAt: -1 } }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
