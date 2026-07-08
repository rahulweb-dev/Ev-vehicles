import { getPlatformImage } from "./imageResize";

const FB_API = "https://graph.facebook.com/v19.0";

/**
 * Post an article to a Facebook Page feed.
 * @param {object} article  Mongoose Article document (lean)
 * @param {object} creds    Decrypted credentials { accessToken, pageId }
 * @returns {{ postId: string }}
 */
export async function postToFacebook(article, creds) {
  const { accessToken, pageId } = creds;
  if (!accessToken || !pageId) throw new Error("Facebook Page Access Token and Page ID are required");

  const siteUrl    = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/news/${article.slug}`;
  // Facebook optimal: 1200×630 (1.91:1 Open Graph ratio)
  const imageUrl   = getPlatformImage(article.image, "facebook");

  const message = [
    `⚡ ${article.title}`,
    "",
    article.excerpt,
    "",
    `🔗 Read more: ${articleUrl}`,
    "",
    "#EVNews #ElectricVehicles #EV #EVRadar",
  ].join("\n");

  const res = await fetch(`${FB_API}/${pageId}/feed`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      link:         articleUrl,
      picture:      imageUrl,   // 1200×630 cropped by ImageKit
      access_token: accessToken,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Facebook: ${data.error.message}`);
  if (!res.ok)    throw new Error(`Facebook: HTTP ${res.status}`);

  return { postId: data.id };
}
