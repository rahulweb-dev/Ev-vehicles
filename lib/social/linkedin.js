const LI_API = "https://api.linkedin.com/v2";

/**
 * Post an article to a LinkedIn Company Page via UGC Posts API.
 * @param {object} article  Lean Article document
 * @param {object} creds    Decrypted { accessToken, companyUrn }
 *                          companyUrn can be "123456789" or full "urn:li:organization:123456789"
 * @returns {{ postId: string }}
 */
export async function postToLinkedIn(article, creds) {
  const { accessToken, companyUrn } = creds;
  if (!accessToken || !companyUrn) throw new Error("LinkedIn Access Token and Company URN are required");

  const siteUrl    = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/news/${article.slug}`;
  const author     = companyUrn.startsWith("urn:") ? companyUrn : `urn:li:organization:${companyUrn}`;

  const commentary = [
    `⚡ ${article.title}`,
    "",
    article.excerpt,
    "",
    `Read the full article: ${articleUrl}`,
    "",
    "#EVNews #ElectricVehicles #India #EV #Sustainability",
  ].join("\n");

  const body = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary:    { text: commentary },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status:      "READY",
            description: { text: article.excerpt },
            originalUrl: articleUrl,
            title:       { text: article.title },
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch(`${LI_API}/ugcPosts`, {
    method:  "POST",
    headers: {
      Authorization:               `Bearer ${accessToken}`,
      "Content-Type":              "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`LinkedIn: ${data.message || data.serviceErrorCode || `HTTP ${res.status}`}`);

  // LinkedIn returns the post ID in the X-RestLi-Id header or data.id
  const postId = res.headers.get("x-restli-id") || data.id || "";
  return { postId };
}
