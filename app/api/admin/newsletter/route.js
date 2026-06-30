import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";
import { requireAuth } from "@/lib/auth";

// POST /api/admin/newsletter — send newsletter to active subscribers
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { subject, html, previewText, testEmail } = await request.json();
  if (!subject || !html) {
    return NextResponse.json({ error: "subject and html are required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set in environment variables" }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM || "EV News India <newsletter@evradar.in>";

  // Test send — single email only
  if (testEmail) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, sent: 1, mode: "test", id: data?.id });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Full send to all active subscribers
  try {
    await dbConnect();
    const subscribers = await Subscriber.find({ status: "active" }).select("email").lean();

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers to send to" }, { status: 400 });
    }

    const emails = subscribers.map(s => s.email);

    // Resend supports up to 50 recipients per batch call
    const BATCH = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      try {
        // Use BCC pattern: send to each individually to protect subscriber privacy
        const sends = batch.map(to =>
          resend.emails.send({ from: fromAddress, to, subject, html })
        );
        const results = await Promise.allSettled(sends);
        results.forEach(r => { r.status === "fulfilled" ? sent++ : failed++; });
      } catch {
        failed += batch.length;
      }
    }

    return NextResponse.json({ success: true, total: emails.length, sent, failed });
  } catch (error) {
    console.error("[POST /api/admin/newsletter]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
