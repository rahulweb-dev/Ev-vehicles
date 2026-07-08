import { getPlatformImage } from "./imageResize";

const PIN_API = "https://api.pinterest.com/v5";

/**
 * Create a Pin on a Pinterest board.
 * @param {object} article  Lean Article document
 * @param {object} creds    Decrypted { accessToken, boardId }
 * @returns {{ postId: string }}
 */
export async function postToPinterest(article, creds) {
  const { accessToken, boardId } = creds;
  if (!accessToken || !boardId) throw new Error("Pinterest Access Token and Board ID are required");

  const siteUrl    = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/news/${article.slug}`;
  // Pinterest optimal: 1000×1500 (2:3 tall pin — highest saves/click rate)
  const imageUrl   = getPlatformImage(article.image, "pinterest");

  const description = [
    article.excerpt,
    "",
    `#EVNews #ElectricVehicles #India #EV`,
  ].join("\n");

  const body = {
    title:       article.title,
    description,
    link:        articleUrl,
    board_id:    boardId,
    media_source: {
      source_type: "image_url",
      url:         imageUrl,   // 1000×1500 tall pin crop
    },
  };

  const res = await fetch(`${PIN_API}/pins`, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Pinterest: ${data.message || `HTTP ${res.status}`}`);

  return { postId: data.id };
}
