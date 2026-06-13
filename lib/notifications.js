const SITE_URL = "https://www.evradar.in";

/* ── SendGrid ─────────────────────────────────────────────────── */
export async function sendArticlePublishedEmail(article) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return;

  const articleUrl = `${SITE_URL}/news/${article.slug}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 12px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#16a34a,#059669);padding:32px;text-align:center">
      <img src="${SITE_URL}/images/logo.png" alt="EVRadar" style="height:40px;margin-bottom:16px">
      <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0">New Article Published ⚡</h1>
    </div>
    <div style="padding:32px">
      ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width:100%;border-radius:12px;margin-bottom:20px;object-fit:cover;max-height:280px">` : ""}
      <span style="background:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:0.5px">${article.category}</span>
      <h2 style="font-size:20px;font-weight:900;color:#111827;margin:12px 0 8px">${article.title}</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">${article.excerpt || ""}</p>
      <a href="${articleUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none">Read Full Article →</a>
    </div>
    <div style="border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center">
      <p style="color:#9ca3af;font-size:11px;margin:0">You received this because you're subscribed to EVRadar notifications.<br>
      <a href="${SITE_URL}/unsubscribe" style="color:#16a34a">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: process.env.SENDGRID_TO_EMAIL || "subscribers@evradar.in" }] }],
        from:    { email: process.env.SENDGRID_FROM_EMAIL || "noreply@evradar.in", name: "EV News India" },
        subject: `New Article: ${article.title}`,
        content: [{ type: "text/html", value: html }],
      }),
    });
  } catch (err) {
    console.error("[sendArticlePublishedEmail]", err.message);
  }
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

/* ── Combined on-publish hook ─────────────────────────────────── */
export async function notifyArticlePublished(article) {
  await Promise.allSettled([
    sendArticlePublishedEmail(article),
    sendWhatsAppBroadcast(article),
  ]);
}
