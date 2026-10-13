import { NextResponse } from "next/server";
import dbConnect  from "@/lib/mongodb";
import Campaign   from "@/lib/models/Campaign";

// GET /api/track/click?c=CAMPAIGN_ID&url=BASE64URL_ENCODED_DESTINATION
// Only redirects to our own site or to a link that really is in that campaign's email —
// otherwise evradar.in/api/track/click?url=<anything> would be an open redirect for phishing.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("c");
  const encoded    = searchParams.get("url");
  const home       = new URL("/", request.url);

  let target = null, raw = "";
  try {
    if (encoded) {
      raw = Buffer.from(encoded, "base64url").toString();
      const u = new URL(raw);
      if (u.protocol === "https:" || u.protocol === "http:") target = u;
    }
  } catch {}

  const isOwnSite = (u) => u.hostname === "evradar.in" || u.hostname.endsWith(".evradar.in") || u.hostname === home.hostname;

  let campaign = null;
  if (campaignId && /^[a-f0-9]{24}$/i.test(campaignId)) {
    try {
      await dbConnect();
      campaign = await Campaign.findById(campaignId).select("html").lean();
    } catch {}
  }

  if (target && !isOwnSite(target) && !(campaign?.html && (campaign.html.includes(raw) || campaign.html.includes(target.href)))) target = null;
  const destination = target || home;

  if (campaign) {
    Campaign.findByIdAndUpdate(campaignId, {
      $inc: { clickCount: 1 },
      $push: {
        clickUrls: {
          $each: [{ url: destination.href, at: new Date() }],
          $slice: -200,  // keep last 200 click events
        },
      },
    }).catch(() => {});
  }

  return NextResponse.redirect(destination, { status: 302 });
}
