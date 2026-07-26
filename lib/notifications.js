import { broadcastMail } from "@/lib/mailer";

const SITE_URL = "https://www.evradar.in";

async function getActiveSubscriberEmails() {
  const dbConnect  = (await import("@/lib/mongodb")).default;
  const Subscriber = (await import("@/lib/models/Subscriber")).default;
  await dbConnect();
  const rows = await Subscriber.find({ status: "active" }).select("email").lean();
  return rows.map(s => s.email);
}

async function smtpBroadcast({ subject, html }) {
  let emails = [];
  try {
    emails = await getActiveSubscriberEmails();
  } catch (err) {
    console.error("[notify] DB error:", err.message);
    return;
  }
  if (!emails.length) return;
  return broadcastMail({ emails, subject, html });
}

function articleEmailHtml(article) {
  const url      = `${SITE_URL}/news/${article.slug}`;
  const catLabel = (article.category || "ev").toUpperCase();
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${article.title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <tr><td style="background:linear-gradient(135deg,#15803d,#166534);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
    <p style="margin:0 0 6px;color:#86efac;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">⚡ New Article</p>
    <p style="margin:0;color:#fff;font-size:22px;font-weight:900">EV Radar</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px">
    ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width:100%;border-radius:12px;margin-bottom:20px;max-height:260px;object-fit:cover;display:block">` : ""}
    <span style="background:#dcfce7;color:#15803d;font-size:10px;font-weight:800;padding:4px 12px;border-radius:50px;text-transform:uppercase;letter-spacing:1px">${catLabel}</span>
    <h2 style="margin:14px 0 10px;color:#111827;font-size:22px;font-weight:900;line-height:1.3">${article.title}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7">${article.excerpt || ""}</p>
    <a href="${url}" style="display:inline-block;background:#15803d;color:#fff;font-size:14px;font-weight:800;padding:14px 28px;border-radius:10px;text-decoration:none">Read Full Article →</a>
    ${article.author ? `<p style="margin:20px 0 0;color:#9ca3af;font-size:12px">By ${article.author} · ${article.readTime || "5 min read"}</p>` : ""}
  </td></tr>
  <tr><td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 6px;color:#6b7280;font-size:12px">© 2026 EV Radar · <a href="${SITE_URL}" style="color:#15803d;text-decoration:none">evradar.in</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px">You're subscribed to EV news alerts · <a href="${SITE_URL}/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function blogEmailHtml(blog) {
  const url = `${SITE_URL}/blogs/${blog.slug}`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${blog.title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <tr><td style="background:linear-gradient(135deg,#1d4ed8,#1e40af);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
    <p style="margin:0 0 6px;color:#bfdbfe;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">📝 New Blog Post</p>
    <p style="margin:0;color:#fff;font-size:22px;font-weight:900">EV Radar</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px">
    ${blog.image ? `<img src="${blog.image}" alt="${blog.title}" style="width:100%;border-radius:12px;margin-bottom:20px;max-height:260px;object-fit:cover;display:block">` : ""}
    <span style="background:#dbeafe;color:#1d4ed8;font-size:10px;font-weight:800;padding:4px 12px;border-radius:50px;text-transform:uppercase;letter-spacing:1px">Blog</span>
    <h2 style="margin:14px 0 10px;color:#111827;font-size:22px;font-weight:900;line-height:1.3">${blog.title}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7">${blog.excerpt || ""}</p>
    <a href="${url}" style="display:inline-block;background:#1d4ed8;color:#fff;font-size:14px;font-weight:800;padding:14px 28px;border-radius:10px;text-decoration:none">Read Full Post →</a>
  </td></tr>
  <tr><td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 6px;color:#6b7280;font-size:12px">© 2026 EV Radar · <a href="${SITE_URL}" style="color:#1d4ed8;text-decoration:none">evradar.in</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px">You're subscribed to EV news alerts · <a href="${SITE_URL}/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/* ── Public: article email broadcast ──────────────────────────── */
export async function sendArticlePublishedEmail(article) {
  return smtpBroadcast({
    subject: `⚡ ${article.title}`,
    html:    articleEmailHtml(article),
  }).catch(err => console.error("[sendArticlePublishedEmail]", err.message));
}

/* ── Public: blog email broadcast ─────────────────────────────── */
export async function sendBlogPublishedEmail(blog) {
  return smtpBroadcast({
    subject: `📝 New Post: ${blog.title}`,
    html:    blogEmailHtml(blog),
  }).catch(err => console.error("[sendBlogPublishedEmail]", err.message));
}

/* ── WhatsApp Business API ────────────────────────────────────── */
export async function sendWhatsAppBroadcast(article) {
  const token    = process.env.WHATSAPP_API_TOKEN;
  const phoneId  = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const toNumber = process.env.WHATSAPP_BROADCAST_NUMBER;

  if (!token || !phoneId || !toNumber) return;

  const articleUrl = `${SITE_URL}/news/${article.slug}`;
  const message    = `⚡ *New on EVRadar!*\n\n*${article.title}*\n\n${article.excerpt || ""}\n\n📖 Read more: ${articleUrl}`;

  try {
    await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type:    "individual",
        to:                toNumber,
        type:              "text",
        text:              { body: message },
      }),
    });
  } catch (err) {
    console.error("[sendWhatsAppBroadcast]", err.message);
  }
}

/* ── Twitter / X v2 API ───────────────────────────────────────── */
export async function postToTwitter(article) {
  const bearerToken   = process.env.TWITTER_BEARER_TOKEN;
  const apiKey        = process.env.TWITTER_API_KEY;
  const apiSecret     = process.env.TWITTER_API_SECRET;
  const accessToken   = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret  = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return;

  const articleUrl = `${SITE_URL}/news/${article.slug}`;
  const title      = article.title.length > 200 ? article.title.slice(0, 197) + "…" : article.title;
  const hashtags   = ["#EV", "#ElectricVehicle", "#EVIndia", "#EVNews"].slice(0, 2).join(" ");
  const tweet      = `${title}\n\n${hashtags}\n\n${articleUrl}`;

  // OAuth 1.0a signature
  const nonce     = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method    = "POST";
  const url       = "https://api.twitter.com/2/tweets";

  const params = {
    oauth_consumer_key:     apiKey,
    oauth_nonce:            nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        timestamp,
    oauth_token:            accessToken,
    oauth_version:          "1.0",
  };

  const paramStr = Object.keys(params).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const baseStr = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
  const sigKey  = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;

  let signature;
  try {
    const { createHmac } = await import("crypto");
    signature = createHmac("sha1", sigKey).update(baseStr).digest("base64");
  } catch {
    return;
  }

  const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(apiKey)}",oauth_nonce="${nonce}",oauth_signature="${encodeURIComponent(signature)}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_token="${encodeURIComponent(accessToken)}",oauth_version="1.0"`;

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ text: tweet }),
    });
    if (!res.ok) {
      const e = await res.text();
      console.error("[postToTwitter] API error:", e);
    }
  } catch (err) {
    console.error("[postToTwitter]", err.message);
  }
}

/* ── Combined on-publish hook ─────────────────────────────────── */
export async function notifyArticlePublished(article) {
  const { sendPushToAll } = await import("@/lib/pushNotify");
  const articleUrl = `${SITE_URL}/news/${article.slug}`;

  await Promise.allSettled([
    sendArticlePublishedEmail(article),
    sendWhatsAppBroadcast(article),
    postToTwitter(article),
    sendPushToAll({
      title:   article.title,
      body:    article.excerpt || "Tap to read the latest EV news",
      icon:    "/images/logo.png",
      badge:   "/images/badge.png",
      url:     articleUrl,
      image:   article.image || undefined,
      tag:     article.slug,
      actions: [{ action: "read", title: "Read Now" }],
    }),
  ]);
}
