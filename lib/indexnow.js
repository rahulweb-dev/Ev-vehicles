const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");

export async function pingIndexNow(urls) {
  if (!INDEXNOW_KEY) {
    console.warn("[IndexNow] INDEXNOW_KEY not set — skipping ping");
    return { success: false, reason: "key_not_set" };
  }

  const urlList = Array.isArray(urls) ? urls : [urls];
  const host = new URL(SITE_URL).hostname;
  // The key file MUST exist at this URL for IndexNow to accept submissions
  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation, urlList }),
    });
    const ok = res.status === 200 || res.status === 202;
    console.log(`[IndexNow] Pinged ${urlList.length} URL(s) — HTTP ${res.status}${ok ? " ✓" : " ✗ (check key file exists at " + keyLocation + ")"}`);
    return { success: ok, status: res.status };
  } catch (err) {
    console.error("[IndexNow] Network error:", err.message);
    return { success: false, error: err.message };
  }
}

export function buildArticleUrl(slug) { return `${SITE_URL}/news/${slug}`; }
export function buildBlogUrl(slug)    { return `${SITE_URL}/blogs/${slug}`; }
export function buildVehicleUrl(slug, type = "car") {
  const segment = type === "bike" ? "bikes" : type === "commercial" ? "commercial" : "cars";
  return `${SITE_URL}/${segment}/${slug}`;
}
