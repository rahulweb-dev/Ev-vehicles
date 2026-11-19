// "Connect with Facebook" (Facebook Login for the admin) + webhook helpers.
// The Meta app's App ID and App Secret are stored (encrypted) in Social Settings → Facebook.
import crypto from "crypto";
import { decrypt, encrypt } from "@/lib/encrypt";
import { GRAPH } from "./meta";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");
export const OAUTH_REDIRECT = `${SITE_URL}/api/admin/social/meta/callback`;
export const WEBHOOK_URL = `${SITE_URL}/api/webhooks/meta`;

// Permissions requested at login (posting, comments and messages for the Page + Instagram)
export const SCOPES = [
  "pages_show_list", "pages_read_engagement", "pages_read_user_content", "pages_manage_posts",
  "pages_manage_engagement", "pages_manage_metadata", "pages_messaging", "business_management",
  "instagram_basic", "instagram_content_publish", "instagram_manage_comments", "instagram_manage_messages",
];

export async function getFacebookDoc() {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await dbConnect();
  return SocialSettings.findOne({ platform: "facebook" });
}

export async function getAppCreds() {
  const doc = await getFacebookDoc();
  const dec = (v) => (v ? decrypt(v) : "");
  return {
    appId: dec(doc?.credentials?.appId) || process.env.META_APP_ID || "",
    appSecret: dec(doc?.credentials?.appSecret) || process.env.META_APP_SECRET || "",
    userToken: dec(doc?.credentials?.userToken),
  };
}

/** Ask Meta whether an App ID + App Secret pair is valid. Returns "" if valid, else the reason. */
export async function checkAppCreds(appId, appSecret) {
  if (!appId || !appSecret) return "App ID and App Secret are both required";
  try {
    const r = await fetch(`${GRAPH}/${encodeURIComponent(appId)}?fields=name&access_token=${encodeURIComponent(appId)}|${encodeURIComponent(appSecret)}`);
    const d = await r.json();
    if (d.id || d.name) return "";
    return /signature/i.test(d.error?.message || "")
      ? "The App Secret doesn't belong to this App ID. In Meta → App settings → Basic, click Show next to App secret and copy that value (not the Client Token)."
      : d.error?.message || "Meta rejected the App ID / App Secret";
  } catch (e) { return "Couldn't reach Meta to check the App Secret: " + e.message; }
}

/** Verify token to paste into the Meta webhook settings — derived from the App Secret, so nothing extra to store. */
export function webhookVerifyToken(appSecret) {
  return appSecret ? crypto.createHmac("sha256", appSecret).update("evradar-meta-webhook").digest("hex").slice(0, 32) : "";
}

/** Check Meta's X-Hub-Signature-256 header against the raw request body. */
export function validSignature(rawBody, header, appSecret) {
  if (!header || !appSecret) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(header), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function graphGet(path, params) {
  const url = new URL(`${GRAPH}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data;
}

/** code → short-lived user token → long-lived user token (~60 days). */
export async function exchangeCode(code, { appId, appSecret }) {
  const short = await graphGet("oauth/access_token", { client_id: appId, client_secret: appSecret, redirect_uri: OAUTH_REDIRECT, code });
  const long = await graphGet("oauth/access_token", { grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: short.access_token });
  return long.access_token;
}

/** Pages the user manages, with the linked Instagram professional account if any. */
export async function listPages(userToken) {
  const r = await graphGet("me/accounts", { access_token: userToken, fields: "id,name,picture{url},instagram_business_account{id,username,profile_picture_url}", limit: "100" });
  return (r.data || []).map((p) => ({ id: p.id, name: p.name, picture: p.picture?.data?.url || "", instagram: p.instagram_business_account ? { id: p.instagram_business_account.id, username: p.instagram_business_account.username, picture: p.instagram_business_account.profile_picture_url || "" } : null }));
}

/** Save the chosen Page (+ its Instagram account) and subscribe the Page to webhooks. */
export async function connectPage(pageId) {
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  const { userToken } = await getAppCreds();
  if (!userToken) throw new Error("Connect with Facebook first");
  // A Page token obtained with a long-lived user token does not expire
  const page = await graphGet(pageId, { access_token: userToken, fields: "id,name,access_token,instagram_business_account{id,username}" });
  if (!page.access_token) throw new Error("Facebook didn't return a token for this Page — make sure you're an admin of it and granted all permissions");
  const fb = await SocialSettings.findOne({ platform: "facebook" });
  const creds = { ...(fb?.credentials?.toObject?.() || {}), accessToken: encrypt(page.access_token), pageId: encrypt(page.id) };

  let webhookSubscribed = false, webhookError = "";
  try {
    const res = await fetch(`${GRAPH}/${page.id}/subscribed_apps`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscribed_fields: "messages,feed", access_token: page.access_token }) });
    const d = await res.json();
    webhookSubscribed = !!d.success; if (!d.success) webhookError = d.error?.message || "Subscription failed";
  } catch (e) { webhookError = e.message; }

  await SocialSettings.findOneAndUpdate({ platform: "facebook" },
    { $set: { enabled: true, credentials: creds, account: { name: page.name, id: page.id, connectedAt: new Date(), webhookSubscribed, webhookError } } },
    { upsert: true });
  if (page.instagram_business_account?.id) {
    const ig = await SocialSettings.findOne({ platform: "instagram" });
    await SocialSettings.findOneAndUpdate({ platform: "instagram" },
      { $set: { enabled: true, credentials: { ...(ig?.credentials?.toObject?.() || {}), igUserId: encrypt(page.instagram_business_account.id) },
        account: { username: page.instagram_business_account.username, id: page.instagram_business_account.id, connectedAt: new Date() } } },
      { upsert: true });
  }
  return { page: { id: page.id, name: page.name }, instagram: page.instagram_business_account || null, webhookSubscribed, webhookError };
}
