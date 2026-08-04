import { NextResponse } from "next/server";
import dbConnect  from "@/lib/mongodb";
import PageView   from "@/lib/models/PageView";

export async function POST(request) {
  try {
    const { path, title, referrer, sessionId, device, utm } = await request.json();
    if (!path || !sessionId) return NextResponse.json({ ok: false });

    await dbConnect();

    // Single upsert: insert only when no matching view exists in the last 30 min.
    // Uses the { sessionId, path, createdAt } compound index — halves DB round-trips vs exists()+create().
    const since = new Date(Date.now() - 30 * 60 * 1000);
    await PageView.updateOne(
      { sessionId, path, createdAt: { $gte: since } },
      {
        $setOnInsert: {
          path:      path.slice(0, 500),
          title:     (title    || "").slice(0, 300),
          referrer:  (referrer || "").slice(0, 200),
          sessionId,
          device:    device || "desktop",
          utm:       utm || {},
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
