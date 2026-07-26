import { NextResponse }  from "next/server";
import { requireAuth }   from "@/lib/auth";
import dbConnect         from "@/lib/mongodb";
import Subscriber        from "@/lib/models/Subscriber";
import { sendMail, broadcastMail } from "@/lib/mailer";

// POST /api/admin/newsletter — send newsletter to active subscribers
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { subject, html, previewText, testEmail } = await request.json();
  if (!subject || !html) {
    return NextResponse.json({ error: "subject and html are required" }, { status: 400 });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({ error: "SMTP_USER / SMTP_PASS not configured in .env.local" }, { status: 503 });
  }

  // Test send — single email only
  if (testEmail) {
    try {
      await sendMail({ to: testEmail, subject: `[TEST] ${subject}`, html });
      return NextResponse.json({ success: true, sent: 1, mode: "test" });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  // Full send to all active subscribers
  try {
    await dbConnect();
    const subscribers = await Subscriber.find({ status: "active" }).select("email").lean();
    if (!subscribers.length) {
      return NextResponse.json({ error: "No active subscribers to send to" }, { status: 400 });
    }
    const emails = subscribers.map(s => s.email);
    const { sent, failed } = await broadcastMail({ emails, subject, html });
    return NextResponse.json({ success: true, total: emails.length, sent, failed });
  } catch (err) {
    console.error("[POST /api/admin/newsletter]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
