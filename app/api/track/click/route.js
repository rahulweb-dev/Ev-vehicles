import { NextResponse } from "next/server";
import dbConnect  from "@/lib/mongodb";
import Campaign   from "@/lib/models/Campaign";

// GET /api/track/click?c=CAMPAIGN_ID&url=BASE64URL_ENCODED_DESTINATION
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("c");
  const encoded    = searchParams.get("url");

  let destination = "/";
  try {
    if (encoded) destination = Buffer.from(encoded, "base64url").toString();
  } catch {}

  // Track the click (fire-and-forget)
  if (campaignId) {
    dbConnect()
      .then(() => Campaign.findByIdAndUpdate(campaignId, {
        $inc: { clickCount: 1 },
        $push: {
          clickUrls: {
            $each: [{ url: destination, at: new Date() }],
            $slice: -200,  // keep last 200 click events
          },
        },
      }))
      .catch(() => {});
  }

  return NextResponse.redirect(destination, { status: 302 });
}
