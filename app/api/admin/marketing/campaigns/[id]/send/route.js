import { NextResponse }  from "next/server";
import { requireAuth }   from "@/lib/auth";
import dbConnect         from "@/lib/mongodb";
import Campaign          from "@/lib/models/Campaign";
import Subscriber        from "@/lib/models/Subscriber";
import { sendMail, broadcastMail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({ error: "SMTP not configured in .env.local" }, { status: 503 });
  }

  const { id } = await params;
  const body   = await request.json().catch(() => ({}));
  const { testEmail, recipients = "subscribers", customEmails = [] } = body;

  await dbConnect();
  const campaign = await Campaign.findById(id);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "sent") return NextResponse.json({ error: "Already sent" }, { status: 400 });

  // ── Test send ────────────────────────────────────────────────
  if (testEmail) {
    try {
      await sendMail({ to: testEmail, subject: `[TEST] ${campaign.subject}`, html: campaign.html });
      return NextResponse.json({ success: true, mode: "test", sent: 1 });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  // ── Build final recipient list ───────────────────────────────
  let emails = [];

  if (recipients === "subscribers" || recipients === "both") {
    const subs = await Subscriber.find({ status: "active" }).select("email").lean();
    emails.push(...subs.map(s => s.email));
  }

  if ((recipients === "custom" || recipients === "both") && Array.isArray(customEmails)) {
    const valid = customEmails.filter(e => EMAIL_RE.test(e));
    emails.push(...valid);
  }

  // Deduplicate
  emails = [...new Set(emails.map(e => e.toLowerCase()))];

  if (!emails.length) {
    return NextResponse.json({ error: "No valid recipients found" }, { status: 400 });
  }

  await Campaign.findByIdAndUpdate(id, { status: "sending", recipientCount: emails.length });

  const { sent, failed } = await broadcastMail({
    emails,
    subject: campaign.subject,
    html:    campaign.html,
  });

  await Campaign.findByIdAndUpdate(id, {
    status:      failed === emails.length ? "failed" : "sent",
    sentCount:   sent,
    failedCount: failed,
    sentAt:      new Date(),
  });

  return NextResponse.json({ success: true, total: emails.length, sent, failed });
}
