import nodemailer    from "nodemailer";
import { createHmac } from "crypto";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");

/** Generate a per-email unsubscribe token (HMAC-SHA256 of the email address). */
export function unsubToken(email) {
  return createHmac("sha256", process.env.JWT_SECRET || "ev-radar-secret")
    .update(email.toLowerCase().trim())
    .digest("base64url");
}

/** Full unsubscribe URL for a given email address. */
export function unsubUrl(email) {
  return `${SITE}/unsubscribe?t=${unsubToken(email)}`;
}

/** Tiny HTML footer with a personalised unsubscribe link. */
export function unsubFooter(email) {
  return `
    <div style="margin-top:32px;padding:16px 0;border-top:1px solid #f3f4f6;text-align:center">
      <p style="margin:0;font-size:11px;color:#9ca3af">
        You're receiving this because you subscribed to EV Radar updates.<br/>
        <a href="${unsubUrl(email)}" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a>
      </p>
    </div>`;
}

/** Wrap html with an email-open tracking pixel (1×1 gif). */
export function withOpenPixel(html, campaignId) {
  const pixel = `<img src="${SITE}/api/track/open?c=${campaignId}" width="1" height="1" style="display:none;border:0" alt="" />`;
  return html + pixel;
}

/** Rewrite every href in html through the click-tracker for a campaign. */
export function withClickTracking(html, campaignId) {
  return html.replace(/href="(https?:\/\/[^"]+)"/gi, (_, url) => {
    const encoded = Buffer.from(url).toString("base64url");
    return `href="${SITE}/api/track/click?c=${campaignId}&url=${encoded}"`;
  });
}

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
/**
 * Enqueue a broadcast campaign into MongoDB — returns immediately without sending.
 * A cron worker (/api/admin/mail-worker) drains the queue at its own pace,
 * avoiding Vercel function timeouts on large lists.
 *
 * Each recipient gets personalised click tracking, open pixel, and unsub footer
 * applied by the worker at send time (not here) so the DB stores the clean template.
 */
export async function broadcastMail({ emails, subject, html, campaignId = null, addUnsub = true }) {
  if (!emails?.length) return { queued: 0 };

  const { default: dbConnect } = await import("./mongodb.js");
  const { default: MailQueue } = await import("./models/MailQueue.js");
  await dbConnect();

  const docs = emails.map(email => ({
    campaignId,
    email,
    subject,
    html,        // stored as template; worker applies per-recipient transforms
    status:      "pending",
    processAt:   new Date(),
    _addUnsub:   addUnsub,  // hint for worker
  }));

  // insertMany with ordered:false so a duplicate email doesn't block the rest
  await MailQueue.insertMany(docs, { ordered: false }).catch(() => {});

  return { queued: emails.length };
}
