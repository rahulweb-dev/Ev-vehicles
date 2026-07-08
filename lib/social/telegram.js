import { getPlatformImage } from "./imageResize";

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
  // Telegram optimal: 1280×720 (16:9 — best for link preview thumbnail)
  const imageUrl   = getPlatformImage(article.image, "telegram");

  // Escape special MarkdownV2 chars in title / excerpt
  function escMd(text = "") {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
  }

  // Send as a photo with caption (1280×720 crop) so Telegram renders the image properly
  const caption = [
    `⚡ *${escMd(article.title)}*`,
    "",
    escMd(article.excerpt),
    "",
    `[🔗 Read full article](${articleUrl})`,
    "",
    `\\#EVNews \\#ElectricVehicles \\#India \\#EV`,
  ].join("\n");

  const res = await fetch(`${TG_API}/bot${botToken}/sendPhoto`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    channelId,
      photo:      imageUrl,   // 1280×720 ImageKit crop
      caption,
      parse_mode: "MarkdownV2",
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram: ${data.description || `HTTP ${res.status}`}`);

  return { messageId: String(data.result.message_id) };
}
