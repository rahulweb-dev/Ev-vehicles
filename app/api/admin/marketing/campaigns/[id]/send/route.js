import { NextResponse } from "next/server";
import { Resend }       from "resend";
import { requireAuth }  from "@/lib/auth";
import dbConnect        from "@/lib/mongodb";
import Campaign         from "@/lib/models/Campaign";
import Subscriber       from "@/lib/models/Subscriber";

export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });

  const { id } = await params;
  const body   = await request.json().catch(() => ({}));
  const { testEmail } = body;

  await dbConnect();
  const campaign = await Campaign.findById(id);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "sent") return NextResponse.json({ error: "Already sent" }, { status: 400 });

  const resend  = new Resend(apiKey);
  const from    = process.env.RESEND_FROM || "EV Radar <newsletter@evradar.in>";

  // ── Test send ─────────────────────────────────────────────────────────
  if (testEmail) {
    try {
      const { error } = await resend.emails.send({
        from, to: testEmail,
        subject: `[TEST] ${campaign.subject}`,
        html:    campaign.html,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, mode: "test", sent: 1 });
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── Full send ─────────────────────────────────────────────────────────
  const subscribers = await Subscriber.find({ status: "active" }).select("email").lean();
  if (!subscribers.length) return NextResponse.json({ error: "No active subscribers" }, { status: 400 });

  await Campaign.findByIdAndUpdate(id, { status: "sending", recipientCount: subscribers.length });

  const BATCH = 50;
  let sent = 0, failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(s =>
        resend.emails.send({ from, to: s.email, subject: campaign.subject, html: campaign.html })
      )
    );
    results.forEach(r => { r.status === "fulfilled" ? sent++ : failed++; });
  }

  await Campaign.findByIdAndUpdate(id, {
    status:    failed === subscribers.length ? "failed" : "sent",
    sentCount: sent,
    failedCount: failed,
    sentAt:    new Date(),
  });

  return NextResponse.json({ success: true, total: subscribers.length, sent, failed });
}
