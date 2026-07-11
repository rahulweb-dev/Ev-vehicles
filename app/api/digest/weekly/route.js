import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/mongodb";
import Article from "@/lib/models/Article";
import Subscriber from "@/lib/models/Subscriber";

const SITE_URL = "https://www.evradar.in";
const SITE_NAME = "EV News India";

function buildDigestHtml(articles) {
  const articlesHtml = articles.map(a => {
    const date = a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })
      : "";
    return `
      <tr>
        <td style="padding:0 0 28px 0;">
          ${a.image ? `
          <a href="${SITE_URL}/news/${a.slug}" style="display:block;margin-bottom:12px;">
            <img src="${a.image}" alt="${a.title.replace(/"/g, "&quot;")}"
              style="width:100%;max-width:580px;height:200px;object-fit:cover;border-radius:12px;display:block;" />
          </a>` : ""}
          <p style="margin:0 0 4px 0;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">
            ${a.category || "EV News"} · ${date}
          </p>
          <a href="${SITE_URL}/news/${a.slug}" style="text-decoration:none;">
            <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:900;color:#111827;line-height:1.3;">
              ${a.title}
            </h3>
          </a>
          <p style="margin:0 0 12px 0;font-size:14px;color:#6b7280;line-height:1.6;">
            ${a.excerpt || ""}
          </p>
          <a href="${SITE_URL}/news/${a.slug}"
            style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;">
            Read More →
          </a>
          <hr style="margin:28px 0 0 0;border:none;border-top:1px solid #f3f4f6;" />
        </td>
      </tr>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#16a34a;padding:28px 32px;">
            <a href="${SITE_URL}" style="text-decoration:none;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">⚡ ${SITE_NAME}</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,.8);">Your weekly EV update from India</p>
            </a>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:28px 32px 16px;">
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#111827;">This week in EVs</h2>
            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
              Here are the top stories from India's EV world this week. Tap any headline to read the full story.
            </p>
          </td>
        </tr>

        <!-- Articles -->
        <tr>
          <td style="padding:8px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${articlesHtml}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 32px 32px;text-align:center;">
            <a href="${SITE_URL}/news"
              style="display:inline-block;background:#111827;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;">
              View All EV News →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
              You are receiving this because you subscribed to EV News India.
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              <a href="${SITE_URL}" style="color:#16a34a;text-decoration:none;">${SITE_URL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// GET /api/digest/weekly?secret=YOUR_SECRET
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const expectedSecret = process.env.DIGEST_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 503 });
  }

  try {
    await dbConnect();

    // Fetch top 7 articles from the last 7 days by views, falling back to most recent
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let articles = await Article.find({ status: "published", publishedAt: { $gte: since } })
      .sort({ views: -1, publishedAt: -1 })
      .limit(7)
      .select("slug title excerpt image category publishedAt readTime")
      .lean();

    // If fewer than 3 articles this week, fall back to latest published
    if (articles.length < 3) {
      articles = await Article.find({ status: "published" })
        .sort({ publishedAt: -1 })
        .limit(7)
        .select("slug title excerpt image category publishedAt readTime")
        .lean();
    }

    if (articles.length === 0) {
      return NextResponse.json({ error: "No articles to send" }, { status: 400 });
    }

    const subscribers = await Subscriber.find({ status: "active" }).select("email").lean();
    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
    }

    const html = buildDigestHtml(articles);
    const subject = `⚡ This Week in EVs – ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
    const fromAddress = process.env.RESEND_FROM || `${SITE_NAME} <newsletter@evradar.in>`;

    const resend = new Resend(apiKey);
    const emails = subscribers.map(s => s.email);

    const BATCH = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      const sends = batch.map(to => resend.emails.send({ from: fromAddress, to, subject, html }));
      const results = await Promise.allSettled(sends);
      results.forEach(r => { r.status === "fulfilled" ? sent++ : failed++; });
    }

    return NextResponse.json({
      success: true,
      articles: articles.length,
      subscribers: emails.length,
      sent,
      failed,
    });
  } catch (err) {
    console.error("[GET /api/digest/weekly]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
