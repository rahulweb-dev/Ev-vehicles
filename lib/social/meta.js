// Facebook Page + Instagram (professional account) via the Meta Graph API.
// Credentials live in SocialSettings (encrypted): facebook.{accessToken,pageId}, instagram.{igUserId}.
// Instagram posting uses the Facebook Page access token of the Page the IG account is linked to.
import { decrypt } from "@/lib/encrypt";

export const GRAPH = "https://graph.facebook.com/v23.0";

export async function getMetaConfig() {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await dbConnect();
  const docs = await SocialSettings.find({ platform: { $in: ["facebook", "instagram"] } }).lean();
  const fb = docs.find((d) => d.platform === "facebook");
  const ig = docs.find((d) => d.platform === "instagram");
  const dec = (v) => (v ? decrypt(v) : "");
  return {
    pageToken: dec(fb?.credentials?.accessToken),
    pageId: dec(fb?.credentials?.pageId),
    igUserId: dec(ig?.credentials?.igUserId),
    facebook: { enabled: !!fb?.enabled, autoPost: !!fb?.autoPost },
    instagram: { enabled: !!ig?.enabled, autoPost: !!ig?.autoPost },
  };
}

async function graph(path, { method = "GET", params = {}, token }) {
  const url = new URL(`${GRAPH}/${path.replace(/^\//, "")}`);
  const init = { method, headers: {} };
  if (method === "GET") {
    for (const [k, v] of Object.entries({ ...params, access_token: token })) url.searchParams.set(k, typeof v === "object" ? JSON.stringify(v) : v);
  } else {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify({ ...params, access_token: token });
  }
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(25000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = data.error || {};
    const err = new Error(e.error_user_msg || e.message || `HTTP ${res.status}`);
    err.code = e.code; err.subcode = e.error_subcode;
    throw err;
  }
  return data;
}
export { graph };

/** ImageKit URLs can be converted on the fly; Instagram needs JPEG within 4:5–1.91:1. */
export function instagramImageUrl(url) {
  if (!url) return url;
  if (/ik\.imagekit\.io/.test(url)) {
    const base = url.split("?")[0];
    return `${base}?tr=w-1080,h-1080,cm-pad_resize,bg-FFFFFF,f-jpg`;
  }
  return url;
}

/** Post to the Facebook Page. With an image → photo post (caption includes the link); else a link/text post. */
export async function postToFacebookPage({ message, link, imageUrl }, cfg) {
  if (!cfg.pageToken || !cfg.pageId) throw new Error("Facebook Page access token and Page ID are not set (Admin → Social Settings)");
  if (imageUrl) {
    const caption = [message, link].filter(Boolean).join("\n\n");
    // Facebook photo uploads don't accept WebP — have ImageKit serve a JPEG
    const fbImage = /ik\.imagekit\.io/.test(imageUrl) ? `${imageUrl.split("?")[0]}?tr=w-1600,f-jpg` : imageUrl;
    const r = await graph(`${cfg.pageId}/photos`, { method: "POST", token: cfg.pageToken, params: { url: fbImage, caption, published: true } });
    const id = r.post_id || r.id;
    return { postId: id, permalink: `https://www.facebook.com/${id}` };
  }
  const r = await graph(`${cfg.pageId}/feed`, { method: "POST", token: cfg.pageToken, params: { message, ...(link && { link }) } });
  return { postId: r.id, permalink: `https://www.facebook.com/${r.id}` };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Publish a single-image Instagram post: create container → wait until FINISHED → publish. */
export async function postToInstagram({ caption, imageUrl }, cfg) {
  if (!cfg.pageToken || !cfg.igUserId) throw new Error("Instagram account ID or Facebook Page token is not set (Admin → Social Settings)");
  if (!imageUrl) throw new Error("Instagram posts need an image");
  const container = await graph(`${cfg.igUserId}/media`, { method: "POST", token: cfg.pageToken, params: { image_url: instagramImageUrl(imageUrl), caption: (caption || "").slice(0, 2200) } });
  for (let i = 0; i < 10; i++) {
    const st = await graph(container.id, { token: cfg.pageToken, params: { fields: "status_code" } });
    if (st.status_code === "FINISHED") break;
    if (st.status_code === "ERROR" || st.status_code === "EXPIRED") throw new Error(`Instagram could not process the image (${st.status_code})`);
    await sleep(2000);
  }
  const pub = await graph(`${cfg.igUserId}/media_publish`, { method: "POST", token: cfg.pageToken, params: { creation_id: container.id } });
  let permalink = "";
  try { permalink = (await graph(pub.id, { token: cfg.pageToken, params: { fields: "permalink" } })).permalink || ""; } catch { /* optional */ }
  return { postId: pub.id, permalink };
}
