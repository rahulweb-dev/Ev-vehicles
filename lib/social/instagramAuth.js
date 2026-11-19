// "Connect Instagram" with Instagram Login (Instagram API with Instagram Login).
// Works without linking Instagram to a Facebook Page / business portfolio.
// Credentials (encrypted) live on the SocialSettings "instagram" doc: igAppId, igAppSecret, igToken, igUserId.
import crypto from "crypto";
import { decrypt, encrypt } from "@/lib/encrypt";
import { SITE_URL, WEBHOOK_URL } from "./metaAuth";

export const IG_GRAPH = "https://graph.instagram.com/v23.0";
export const IG_OAUTH_REDIRECT = `${SITE_URL}/api/admin/social/instagram/callback`;
export const IG_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
];
export { WEBHOOK_URL };

async function getIgDoc() {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await dbConnect();
  return SocialSettings.findOne({ platform: "instagram" }).lean();
}

export async function getIgAppCreds() {
  const doc = await getIgDoc();
  const dec = (v) => (v ? decrypt(v) : "");
  return {
    igAppId: dec(doc?.credentials?.igAppId) || process.env.INSTAGRAM_APP_ID || "",
    igAppSecret: dec(doc?.credentials?.igAppSecret) || process.env.INSTAGRAM_APP_SECRET || "",
    igToken: dec(doc?.credentials?.igToken),
    account: doc?.account || null,
  };
}

/** Webhook verify token for the Instagram product — derived from the Instagram App Secret. */
export function igWebhookVerifyToken(igAppSecret) {
  return igAppSecret ? crypto.createHmac("sha256", igAppSecret).update("evradar-ig-webhook").digest("hex").slice(0, 32) : "";
}

async function igFetch(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error || data.error_message) {
    throw new Error(data.error?.message || data.error_message || data.error_description || `HTTP ${res.status}`);
  }
  return data;
}

/** code → short-lived token → long-lived token (60 days) + the professional account's profile. */
export async function igExchangeCode(code, { igAppId, igAppSecret }) {
  const form = new URLSearchParams({ client_id: igAppId, client_secret: igAppSecret, grant_type: "authorization_code", redirect_uri: IG_OAUTH_REDIRECT, code: code.replace(/#_$/, "") });
  const shortRes = await igFetch("https://api.instagram.com/oauth/access_token", { method: "POST", body: form });
  const short = shortRes.data?.[0] || shortRes;
  if (!short.access_token) throw new Error("Instagram didn't return an access token");
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.search = new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: igAppSecret, access_token: short.access_token });
  const long = await igFetch(longUrl);
  const me = await igMe(long.access_token);
  return { token: long.access_token, expiresIn: Number(long.expires_in) || 60 * 86400, me, permissions: short.permissions || [] };
}

export async function igMe(token) {
  const u = new URL(`${IG_GRAPH}/me`);
  u.search = new URLSearchParams({ fields: "user_id,username,name,account_type,profile_picture_url", access_token: token });
  return igFetch(u);
}

/** Subscribe the account to comment and DM webhooks. */
export async function igSubscribeWebhooks(token) {
  try {
    const u = new URL(`${IG_GRAPH}/me/subscribed_apps`);
    u.search = new URLSearchParams({ subscribed_fields: "comments,messages", access_token: token });
    const d = await igFetch(u, { method: "POST" });
    return { webhookSubscribed: !!d.success, webhookError: d.success ? "" : "Subscription failed" };
  } catch (e) { return { webhookSubscribed: false, webhookError: e.message }; }
}

/** Save the Instagram Login connection (takes over from any Facebook-Page-linked Instagram). */
export async function saveIgConnection({ token, expiresIn, me, webhook }) {
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  const ig = await SocialSettings.findOne({ platform: "instagram" });
  const igUserId = String(me.user_id || me.id);
  await SocialSettings.findOneAndUpdate({ platform: "instagram" }, {
    $set: {
      enabled: true,
      credentials: { ...(ig?.credentials?.toObject?.() || {}), igToken: encrypt(token), igUserId: encrypt(igUserId) },
      account: {
        mode: "instagram-login", id: igUserId, username: me.username, name: me.name || "", accountType: me.account_type || "",
        picture: me.profile_picture_url || "", connectedAt: new Date(), tokenRefreshedAt: new Date(),
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000), ...webhook,
      },
    },
  }, { upsert: true });
}

/** Long-lived Instagram tokens last 60 days; refresh weekly from the scheduler cron so they never lapse. */
export async function refreshIgTokenIfDue() {
  const { igToken, account } = await getIgAppCreds();
  if (!igToken || account?.mode !== "instagram-login") return;
  const last = new Date(account.tokenRefreshedAt || account.connectedAt || 0).getTime();
  if (Date.now() - last < 7 * 86400 * 1000) return;
  const u = new URL("https://graph.instagram.com/refresh_access_token");
  u.search = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: igToken });
  const d = await igFetch(u);
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await SocialSettings.updateOne({ platform: "instagram" }, { $set: {
    "credentials.igToken": encrypt(d.access_token),
    "account.tokenRefreshedAt": new Date(),
    "account.tokenExpiresAt": new Date(Date.now() + (Number(d.expires_in) || 60 * 86400) * 1000),
  } });
}

export async function disconnectIg() {
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await SocialSettings.updateOne({ platform: "instagram" }, { $set: { enabled: false, account: null, "credentials.igToken": "", "credentials.igUserId": "" } });
}
