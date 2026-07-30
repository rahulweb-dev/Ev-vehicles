import { NextResponse } from "next/server";
import dbConnect  from "@/lib/mongodb";
import Campaign   from "@/lib/models/Campaign";

// Smallest transparent 1×1 GIF in base64
const GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// GET /api/track/open?c=CAMPAIGN_ID
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("c");

  // Fire-and-forget: increment openCount (don't await — return the pixel immediately)
  if (campaignId) {
    dbConnect()
      .then(() => Campaign.findByIdAndUpdate(campaignId, { $inc: { openCount: 1 } }))
      .catch(() => {});
  }

  return new NextResponse(GIF, {
    status: 200,
    headers: {
      "Content-Type":  "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma":        "no-cache",
    },
  });
}
