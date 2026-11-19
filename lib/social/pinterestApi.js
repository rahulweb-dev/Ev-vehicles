// Pinterest (API v5): "Connect Pinterest" OAuth, token refresh, boards, and creating Pins.
// Stored on SocialSettings "pinterest" (encrypted): clientId (App ID), clientSecret, accessToken, refreshToken, boardId.
// Access tokens last 30 days and refresh tokens a year; the scheduler cron refreshes before expiry.
import { decrypt, encrypt } from "@/lib/encrypt";
import { SITE_URL } from "./metaAuth";

export const PIN_API = "https://api.pinterest.com/v5";
export const PIN_OAUTH_REDIRECT = `${SITE_URL}/api/admin/social/pinterest/callback`;
export const PIN_SCOPES = ["boards:read", "boards:write", "pins:read", "pins:write", "user_accounts:read"];

async function doc() {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  await dbConnect();
  return SocialSettings.findOne({ platform: "pinterest" }).lean();
}

export async function getPinterestConfig() {
  const d = await doc();
  const c = d?.credentials || {};
  const dec = (v) => (v ? decrypt(v) : "");
  return {
    appId: dec(c.clientId) || process.env.PINTEREST_APP_ID || "",
    appSecret: dec(c.clientSecret) || process.env.PINTEREST_APP_SECRET || "",
    accessToken: dec(c.accessToken), refreshToken: dec(c.refreshToken), boardId: dec(c.boardId),
    account: d?.account || null, enabled: !!d?.enabled, autoPost: !!d?.autoPost,
    connected: !!(d?.account?.mode === "oauth" && c.accessToken && c.boardId),
  };
}

async function pin(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${PIN_API}/${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body && { "Content-Type": "application/json" }) },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(25000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Pinterest: ${data.message || `HTTP ${res.status}`}`);
  return data;
}

async function tokenRequest(params, { appId, appSecret }) {
  const res = await fetch(`${PIN_API}/oauth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params), signal: AbortSignal.timeout(20000),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.access_token) throw new Error(`Pinterest: ${d.message || d.error_description || d.error || `HTTP ${res.status}`}`);
  return d;
}

/** OAuth code → tokens + account; saves them (keeps the chosen board if still valid). */
export async function pinterestConnect(code) {
  const cfg = await getPinterestConfig();
  const t = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: PIN_OAUTH_REDIRECT }, cfg);
  const me = await pin("user_account", { token: t.access_token });
  await saveTokens(t, { username: me.username, accountType: me.account_type, picture: me.profile_image || "", connectedAt: new Date() });
  return me;
}

async function saveTokens(t, accountPatch = {}) {
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  const cur = await SocialSettings.findOne({ platform: "pinterest" });
  const creds = { ...(cur?.credentials?.toObject?.() || {}), accessToken: encrypt(t.access_token) };
  if (t.refresh_token) creds.refreshToken = encrypt(t.refresh_token);
  const now = Date.now();
  const account = {
    ...(cur?.account || {}), ...accountPatch, mode: "oauth", tokenRefreshedAt: new Date(),
    tokenExpiresAt: new Date(now + (Number(t.expires_in) || 30 * 86400) * 1000),
    ...(t.refresh_token && { refreshExpiresAt: new Date(now + (Number(t.refresh_token_expires_in) || 365 * 86400) * 1000) }),
    lastError: "",
  };
  await SocialSettings.findOneAndUpdate({ platform: "pinterest" }, { $set: { credentials: creds, account } }, { upsert: true });
}

/** Refresh the access token when it expires within 5 days. Called from the scheduler cron. */
export async function refreshPinterestIfDue(force = false) {
  const cfg = await getPinterestConfig();
  if (cfg.account?.mode !== "oauth" || !cfg.refreshToken) return;
  const exp = new Date(cfg.account.tokenExpiresAt || 0).getTime();
  if (!force && exp - Date.now() > 5 * 86400e3) return;
  try {
    const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: cfg.refreshToken }, cfg);
    await saveTokens(t);
  } catch (e) {
    const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
    await SocialSettings.updateOne({ platform: "pinterest" }, { $set: { "account.lastError": `Login renewal failed: ${e.message}. Click Reconnect Pinterest.` } });
    throw e;
  }
}

export async function listBoards(token) {
  const out = [];
  let bookmark = "";
  for (let i = 0; i < 5; i++) {
    const d = await pin(`boards?page_size=100${bookmark ? `&bookmark=${encodeURIComponent(bookmark)}` : ""}`, { token });
    out.push(...(d.items || []).map((b) => ({ id: b.id, name: b.name, privacy: b.privacy, pins: b.pin_count ?? null })));
    if (!d.bookmark) break;
    bookmark = d.bookmark;
  }
  return out;
}

export async function createBoard(token, name) {
  const b = await pin("boards", { token, method: "POST", body: { name: name.slice(0, 180), description: "Electric vehicle news, launches, prices and buyer's guides from India — EV Radar", privacy: "PUBLIC" } });
  return { id: b.id, name: b.name, privacy: b.privacy };
}

export async function setBoard(boardId, boardName) {
  const SocialSettings = (await import("@/lib/models/SocialSettings")).default;
  const cur = await SocialSettings.findOne({ platform: "pinterest" });
  await SocialSettings.findOneAndUpdate({ platform: "pinterest" }, { $set: {
    enabled: true, credentials: { ...(cur?.credentials?.toObject?.() || {}), boardId: encrypt(String(boardId)) },
    account: { ...(cur?.account || {}), boardId: String(boardId), boardName },
  } }, { upsert: true });
}

/** Create a Pin. Returns { postId, permalink }. */
export async function postToPinterest({ title, description, link, imageUrl, altText }, cfg) {
  cfg = cfg || (await getPinterestConfig());
  if (!cfg.accessToken || !cfg.boardId) throw new Error("Pinterest is not connected (Admin → Social Settings → Connect Pinterest)");
  if (!imageUrl) throw new Error("Pinterest pins need an image");
  const p = await pin("pins", { token: cfg.accessToken, method: "POST", body: {
    board_id: cfg.boardId, title: (title || "").slice(0, 100), description: (description || "").slice(0, 500),
    ...(link && { link }), alt_text: (altText || title || "").slice(0, 500),
    media_source: { source_type: "image_url", url: imageUrl },
  } });
  return { postId: p.id, permalink: `https://www.pinterest.com/pin/${p.id}/` };
}
