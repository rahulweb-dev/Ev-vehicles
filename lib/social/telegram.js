const TG_API = "https://api.telegram.org";

/**
 * Send an article notification to a Telegram channel.
 * @param {object} article  Lean Article document
 * @param {object} creds    Decrypted { botToken, channelId }
 *                          channelId can be "@channelname" or a numeric chat_id
 * @returns {{ messageId: string }}
 */
export async function postToTelegram(article, creds) {
  const { botToken, channelId } = creds;
  if (!botToken || !channelId) throw new Error("Telegram Bot Token and Channel ID are required");

  const siteUrl    = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/news/${article.slug}`;

  // Escape special MarkdownV2 chars in title / excerpt
  function escMd(text = "") {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
  }

  const text = [
    `⚡ *${escMd(article.title)}*`,
    "",
    escMd(article.excerpt),
    "",
    `[🔗 Read full article](${articleUrl})`,
    "",
    `\\#EVNews \\#ElectricVehicles \\#India \\#EV`,
  ].join("\n");

  const res = await fetch(`${TG_API}/bot${botToken}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:                  channelId,
      text,
      parse_mode:               "MarkdownV2",
      disable_web_page_preview: false,
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram: ${data.description || `HTTP ${res.status}`}`);

  return { messageId: String(data.result.message_id) };
}
