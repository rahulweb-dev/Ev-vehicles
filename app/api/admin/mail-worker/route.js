import { NextResponse } from "next/server";
import dbConnect    from "@/lib/mongodb";
import MailQueue    from "@/lib/models/MailQueue";
import Campaign     from "@/lib/models/Campaign";
import { getTransporter, FROM, withClickTracking, withOpenPixel, unsubFooter } from "@/lib/mailer";

// Process up to 50 emails per invocation — handles most subscriber lists in one shot
const BATCH = 50;

export async function GET(request) {
  // Accept Vercel Cron Authorization header or manual secret
  const authHeader  = request.headers.get("authorization");
  const cronSecret  = process.env.CRON_SECRET;
  const schedSecret = process.env.SCHEDULER_SECRET;
  const querySecret = new URL(request.url).searchParams.get("secret");

  const ok = (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
             (schedSecret && querySecret === schedSecret);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const items = await MailQueue.find({
    status:    "pending",
    processAt: { $lte: new Date() },
  }).limit(BATCH).lean();

  if (!items.length) return NextResponse.json({ sent: 0 });

  const transporter = getTransporter();
  let sent = 0, failed = 0;

  const campaignCounts = {}; // track sends per campaign for bulk DB update

  for (const item of items) {
    try {
      let body = item.html;
      const cid = item.campaignId?.toString();
      if (cid) body = withClickTracking(body, cid);
      if (cid) body = withOpenPixel(body, cid);
      if (item._addUnsub !== false) body = body + unsubFooter(item.email);

      await transporter.sendMail({ from: FROM(), to: item.email, subject: item.subject, html: body });

      await MailQueue.findByIdAndUpdate(item._id, { status: "sent" });

      if (cid) campaignCounts[cid] = (campaignCounts[cid] || 0) + 1;
      sent++;
    } catch (err) {
      const attempts = (item.attempts || 0) + 1;
      const status   = attempts >= 3 ? "failed" : "pending";
      // Retry after 5 minutes on transient failure
      const processAt = status === "pending" ? new Date(Date.now() + 5 * 60_000) : undefined;
      await MailQueue.findByIdAndUpdate(item._id, {
        status, attempts, error: err.message, ...(processAt ? { processAt } : {}),
      });
      failed++;
    }
  }

  // Update campaign sentCount in bulk
  await Promise.all(
    Object.entries(campaignCounts).map(([cid, count]) =>
      Campaign.findByIdAndUpdate(cid, { $inc: { sentCount: count } }).catch(() => {})
    )
  );

  return NextResponse.json({ sent, failed, remaining: await MailQueue.countDocuments({ status: "pending" }) });
}
