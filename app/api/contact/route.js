import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { formLimiter, getIp } from "@/lib/rateLimit";

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || secret === "YOUR_RECAPTCHA_SECRET_KEY") return true;
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secret}&response=${token}`,
  });
  const data = await res.json();
  return data.success && data.score >= 0.5;
}

export async function POST(request) {
  const rl = formLimiter.check(getIp(request));
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  try {
    const { name, email, subject, message, recaptchaToken } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: "reCAPTCHA verification failed. Please try again." }, { status: 400 });
    }

    const to = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "contact@evradar.in";

    await sendMail({
      to,
      subject: `[Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#16a34a">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold;color:#374151">Name</td><td style="padding:8px;color:#111827">${name}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:8px;font-weight:bold;color:#374151">Email</td><td style="padding:8px"><a href="mailto:${email}" style="color:#16a34a">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#374151">Subject</td><td style="padding:8px;color:#111827">${subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px">
            <p style="font-weight:bold;color:#374151;margin:0 0 8px">Message</p>
            <p style="color:#111827;white-space:pre-line;margin:0">${message}</p>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#9ca3af">Sent from evradar.in contact form · Reply-To: ${email}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
