import { NextResponse } from "next/server";
import dbConnect   from "@/lib/mongodb";
import DripQueue   from "@/lib/models/DripQueue";
import Article     from "@/lib/models/Article";
import Subscriber  from "@/lib/models/Subscriber";
import { sendMail, unsubUrl } from "@/lib/mailer";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");

// ─── Drip email templates ─────────────────────────────────────────────────────

async function getDrip3Html(email) {
  // Top 5 most-viewed articles this month
  let articles = [];
  try {
    articles = await Article.find({ status: "published" })
      .sort({ views: -1 }).limit(5)
      .select("title slug image excerpt category").lean();
  } catch {}

  const rows = articles.map(a => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6">
        <a href="${SITE}/news/${a.slug}" style="text-decoration:none">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827">${a.title}</p>
          <p style="margin:0;font-size:12px;color:#6b7280">${a.excerpt?.slice(0, 80) || ""}…</p>
        </a>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center"><table width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#15803d,#166534);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#fff;font-size:22px;font-weight:900">⚡ EV Radar</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px">Top EV Stories This Month</p>
  </td></tr>
  <tr><td style="padding:28px 32px">
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#111827">Our most-read articles right now</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280">You've been subscribed for a few days — here's what everyone's been reading:</p>
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <div style="margin-top:24px;text-align:center">
      <a href="${SITE}/news" style="display:inline-block;background:#15803d;color:#fff;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Browse All EV News →
      </a>
    </div>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #f3f4f6">
    <p style="margin:0;font-size:11px;color:#9ca3af">
      EV Radar · <a href="${SITE}" style="color:#9ca3af">${SITE}</a> ·
      <a href="${unsubUrl(email)}" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

function getDrip7Html(email) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center"><table width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#15803d,#166534);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#fff;font-size:22px;font-weight:900">⚡ EV Radar</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px">Your EV Buying Guide</p>
  </td></tr>
  <tr><td style="padding:28px 32px">
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#111827">Thinking of buying an EV in India?</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7">
      Here's your quick-start guide to buying your first electric vehicle in India:
    </p>
    ${[
      ["⚡ Check ARAI Range", "Always check the real-world range (typically 60-70% of ARAI certified figure)."],
      ["💰 Calculate TCO", "EV total cost of ownership is 40-60% lower than petrol over 5 years."],
      ["🔌 Home Charging Setup", "Install a 15A or 32A AC charger at home — costs ₹8,000-₹25,000."],
      ["🏦 FAME II Subsidy", "Check if your chosen EV qualifies for FAME II or state-level subsidies."],
      ["🔋 Battery Warranty", "Look for 8-year/160,000km battery warranty as a minimum."],
    ].map(([icon, text]) => `
      <div style="display:flex;gap:12px;margin-bottom:16px;padding:14px;background:#f0fdf4;border-radius:10px">
        <span style="font-size:20px">${icon}</span>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6">${text}</p>
      </div>`).join("")}
    <div style="margin-top:24px;text-align:center">
      <a href="${SITE}/vehicles" style="display:inline-block;background:#15803d;color:#fff;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Browse EVs & Get Price Quote →
      </a>
    </div>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #f3f4f6">
    <p style="margin:0;font-size:11px;color:#9ca3af">
      EV Radar · <a href="${SITE}" style="color:#9ca3af">${SITE}</a> ·
      <a href="${unsubUrl(email)}" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

// ─── Drip runner (GET /api/admin/drip?secret=xxx) ─────────────────────────────
export async function GET(request) {
  // Accept Vercel Cron Authorization header or fallback query-param secret
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret  = searchParams.get("secret");
  const cronSecret   = process.env.CRON_SECRET;
  const schedSecret  = process.env.SCHEDULER_SECRET;

  const validCron  = cronSecret  && authHeader === `Bearer ${cronSecret}`;
  const validQuery = schedSecret && querySecret === schedSecret;

  if (!validCron && !validQuery) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Find drip items due to send
  const due = await DripQueue.find({
    status: "pending",
    sendAt: { $lte: new Date() },
  }).limit(50).lean();

  if (!due.length) return NextResponse.json({ sent: 0 });

  let sent = 0;
  for (const item of due) {
    // Check subscriber still active
    const sub = await Subscriber.findOne({ email: item.email, status: "active" }).lean();
    if (!sub) {
      await DripQueue.findByIdAndUpdate(item._id, { status: "unsubscribed" });
      continue;
    }

    try {
      if (item.step === 1) {
        // Day 3: top articles
        const html = await getDrip3Html(item.email);
        await sendMail({ to: item.email, subject: "⚡ Most-read EV stories this week", html });
        // Queue step 2 for day 7
        const nextSendAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
        await DripQueue.findByIdAndUpdate(item._id, { step: 2, sendAt: nextSendAt });
      } else if (item.step === 2) {
        // Day 7: buying guide
        const html = getDrip7Html(item.email);
        await sendMail({ to: item.email, subject: "🔋 Your EV buying guide for India", html });
        // Drip sequence complete
        await DripQueue.findByIdAndUpdate(item._id, { status: "done" });
      }
      sent++;
    } catch (err) {
      console.error(`[drip] failed for ${item.email}:`, err.message);
    }
  }

  return NextResponse.json({ sent, checked: due.length });
}
