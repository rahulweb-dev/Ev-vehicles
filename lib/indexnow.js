const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in/";

export async function pingIndexNow(urls) {
  if (!INDEXNOW_KEY) {
    console.warn("[IndexNow] INDEXNOW_KEY not set — skipping ping");
    return { success: false, reason: "key_not_set" };
  }

  const urlList = Array.isArray(urls) ? urls : [urls];
  const host = new URL(SITE_URL).hostname;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    console.log(`[IndexNow] Pinged ${urlList.length} URL(s) — status ${res.status}`);
    return { success: res.status === 200 || res.status === 202, status: res.status };
  } catch (err) {
    console.error("[IndexNow] Error:", err.message);
    return { success: false, error: err.message };
  }
}

export function buildArticleUrl(slug) {
  return `${SITE_URL}/news/${slug}`;
}

export function buildBlogUrl(slug) {
  return `${SITE_URL}/blogs/${slug}`;
}
