import nodemailer from "nodemailer";

// Singleton transporter — reused across requests in the same Node.js process
let _transporter = null;

export function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.hostinger.com",
    port:   parseInt(process.env.SMTP_PORT || "465"),
    secure: (process.env.SMTP_PORT || "465") === "465", // true for 465 (SSL), false for 587 (TLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,         // keep connections alive across sends
    maxConnections: 5,
    rateDelta: 1000,    // throttle: max 5 emails per second
    rateLimit: 5,
  });

  return _transporter;
}

export const FROM = () =>
  process.env.SMTP_FROM || `EV Radar <${process.env.SMTP_USER || "contact@evradar.in"}>`;

/**
 * Send one email.
 */
export async function sendMail({ to, subject, html }) {
  const transporter = getTransporter();
  return transporter.sendMail({ from: FROM(), to, subject, html });
}

/**
 * Broadcast HTML email to an array of email addresses.
 * Sends in serial to respect Hostinger's rate limits.
 * Returns { sent, failed }.
 */
export async function broadcastMail({ emails, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[mailer] SMTP_USER / SMTP_PASS not set — skipping broadcast");
    return { sent: 0, failed: 0 };
  }

  const transporter = getTransporter();
  let sent = 0, failed = 0;

  // Hostinger limits ~500 emails/hour on business hosting.
  // Send in batches of 10 with a small delay to stay safe.
  const BATCH = 10;
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(to => transporter.sendMail({ from: FROM(), to, subject, html }))
    );
    results.forEach(r => (r.status === "fulfilled" ? sent++ : failed++));

    // Small delay between batches to avoid Hostinger rate limit
    if (i + BATCH < emails.length) {
      await new Promise(res => setTimeout(res, 300));
    }
  }

  return { sent, failed };
}
