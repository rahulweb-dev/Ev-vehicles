import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";
import DripQueue  from "@/lib/models/DripQueue";
import { requireAuth } from "@/lib/auth";
import { sendMail, unsubUrl } from "@/lib/mailer";
import { formLimiter, getIp } from "@/lib/rateLimit";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");

function welcomeHtml(email) {
  const unsubLink = unsubUrl(email);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px">
  <tr><td align="center">
    <table width="100%" style="max-width:580px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
      <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
        <p style="margin:0;font-size:28px;font-weight:900;color:#fff">⚡ EV Radar</p>
        <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,.85)">India's #1 Electric Vehicle News Platform</p>
      </td></tr>
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#111827">Welcome aboard! 🎉</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">
          You're now subscribed to <strong>EV Radar</strong> — India's most trusted source for electric vehicle news, launches, prices, and expert reviews.
        </p>
        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6">
          Here's what you'll get in your inbox every week:
        </p>
        <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
          <li>Latest EV launches &amp; price updates in India</li>
          <li>In-depth reviews of electric cars, bikes &amp; scooters</li>
          <li>Charging infrastructure news</li>
          <li>Government policy updates &amp; subsidies</li>
        </ul>
        <div style="text-align:center;margin:24px 0">
          <a href="${SITE}/news" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px">
            Read Latest EV News →
          </a>
        </div>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6">
        <p style="margin:0;font-size:11px;color:#9ca3af">
          You subscribed at <a href="${SITE}" style="color:#16a34a">${SITE}</a><br/>
          <a href="${unsubLink}" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// POST /api/subscribe — public
export async function POST(request) {
  const rl = formLimiter.check(getIp(request));
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  try {
    await dbConnect();
    const body = await request.json();
    const { email, interests } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const VALID_INTERESTS = ["cars", "bikes", "charging", "commercial", "policy"];
    const cleanInterests = Array.isArray(interests)
      ? interests.filter(i => VALID_INTERESTS.includes(i))
      : [];

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        if (cleanInterests.length) existing.interests = cleanInterests;
        await existing.save();
        return NextResponse.json({ success: true, message: "Welcome back! You're re-subscribed." });
      }
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    await Subscriber.create({ email, interests: cleanInterests });
    // Fire-and-forget welcome email
    sendMail({
      to: email,
      subject: "Welcome to EV Radar ⚡ – You're subscribed!",
      html: welcomeHtml(email),
    }).catch(console.error);
    // Enqueue drip sequence: step 1 in 3 days, step 2 handled by runner
    DripQueue.create({
      email,
      step: 1,
      sendAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }).catch(console.error);
    return NextResponse.json(
      { success: true, message: "Subscribed! Check your inbox for a welcome email." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/subscribe]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/subscribe — admin only
export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit  = Math.min(parseInt(searchParams.get("limit")  || "100"), 500);
    const page   = parseInt(searchParams.get("page")   || "1");
    const status = searchParams.get("status") || "active";
    const skip   = (page - 1) * limit;

    const [subscribers, total, totalAll] = await Promise.all([
      Subscriber.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Subscriber.countDocuments({ status }),
      Subscriber.countDocuments({}),
    ]);

    return NextResponse.json({ subscribers, total, totalAll, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[GET /api/subscribe]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
