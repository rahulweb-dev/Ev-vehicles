// "My Social": Facebook Pages and Instagram accounts that each site user connects for themselves.
// They log in through the site's own Meta app (credentials set once by the admin in Social Settings).
import { encrypt, decrypt } from "@/lib/encrypt";
import SocialAccount from "@/lib/models/SocialAccount";
import { GRAPH, IG_GRAPH, postToFacebookPage, postToInstagram } from "./meta";
import { listPagesWithTokens } from "./metaAuth";

/** Public shape for the UI (never includes tokens). */
export function publicAccount(a, owner) {
  return {
    id: String(a._id), platform: a.platform, mode: a.mode, externalId: a.externalId, name: a.name, username: a.username,
    picture: a.picture, webhookSubscribed: !!a.webhookSubscribed, webhookError: a.webhookError || "", lastError: a.lastError || "",
    connectedAt: a.connectedAt, tokenExpiresAt: a.tokenExpiresAt || null,
    ...(owner && { owner: { id: String(owner._id), name: owner.name, email: owner.email, role: owner.role } }),
  };
}

async function subscribePage(pageId, pageToken) {
  try {
    const res = await fetch(`${GRAPH}/${pageId}/subscribed_apps`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscribed_fields: "messages,feed", access_token: pageToken }), signal: AbortSignal.timeout(15000) });
    const d = await res.json();
    return { webhookSubscribed: !!d.success, webhookError: d.success ? "" : d.error?.message || "Subscription failed" };
  } catch (e) { return { webhookSubscribed: false, webhookError: e.message }; }
}

/** After "Connect Facebook": save every Page the user granted (and each Page's linked Instagram). */
export async function saveFacebookAccounts(ownerId, userToken) {
  const pages = await listPagesWithTokens(userToken);
  const saved = [];
  for (const p of pages) {
    if (!p.access_token) continue;
    const webhook = await subscribePage(p.id, p.access_token);
    await SocialAccount.findOneAndUpdate({ owner: ownerId, platform: "facebook", externalId: p.id }, { $set: {
      mode: "facebook-page", name: p.name, picture: p.picture?.data?.url || "", token: encrypt(p.access_token), pageId: p.id,
      tokenExpiresAt: null, lastError: "", connectedAt: new Date(), ...webhook } }, { upsert: true });
    saved.push({ platform: "facebook", name: p.name });
    const ig = p.instagram_business_account;
    if (ig?.id) {
      // Don't overwrite a direct Instagram Login connection of the same account
      const direct = await SocialAccount.exists({ owner: ownerId, platform: "instagram", externalId: ig.id, mode: "instagram-login" });
      if (!direct) {
        await SocialAccount.findOneAndUpdate({ owner: ownerId, platform: "instagram", externalId: ig.id }, { $set: {
          mode: "facebook-page", name: ig.name || ig.username || "", username: ig.username || "", picture: ig.profile_picture_url || "",
          token: encrypt(p.access_token), pageId: p.id, tokenExpiresAt: null, lastError: "", connectedAt: new Date(), ...webhook } }, { upsert: true });
      }
      saved.push({ platform: "instagram", name: ig.username });
    }
  }
  return saved;
}

/** After "Connect Instagram" (Instagram Login). */
export async function saveInstagramAccount(ownerId, { token, expiresIn, me, webhook }) {
  const id = String(me.user_id || me.id);
  await SocialAccount.findOneAndUpdate({ owner: ownerId, platform: "instagram", externalId: id }, { $set: {
    mode: "instagram-login", name: me.name || me.username, username: me.username, picture: me.profile_picture_url || "", token: encrypt(token),
    pageId: "", tokenRefreshedAt: new Date(), tokenExpiresAt: new Date(Date.now() + expiresIn * 1000), lastError: "", connectedAt: new Date(), ...webhook } }, { upsert: true });
  return [{ platform: "instagram", name: me.username }];
}

/** Config object understood by postToFacebookPage / postToInstagram for one account. */
export function accountCfg(a) {
  const token = decrypt(a.token);
  if (a.platform === "facebook") return { pageToken: token, pageId: a.externalId };
  return { igUserId: a.externalId, ig: a.mode === "instagram-login" ? { base: IG_GRAPH, token, mode: "instagram-login" } : { base: GRAPH, token, mode: "facebook-page" } };
}

export async function publishToAccount(a, post) {
  const cfg = accountCfg(a);
  return a.platform === "facebook"
    ? postToFacebookPage({ message: post.message, link: post.link, imageUrl: post.imageUrl }, cfg)
    : postToInstagram({ caption: post.igCaption || post.message, imageUrl: post.imageUrl }, cfg);
}

/** Weekly refresh of users' Instagram Login tokens (60-day tokens). Called from the scheduler cron. */
export async function refreshAccountTokens() {
  const due = await SocialAccount.find({ mode: "instagram-login", tokenRefreshedAt: { $lt: new Date(Date.now() - 7 * 86400e3) } }).limit(20);
  for (const a of due) {
    try {
      const u = new URL("https://graph.instagram.com/refresh_access_token");
      u.search = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: decrypt(a.token) });
      const d = await fetch(u, { signal: AbortSignal.timeout(15000) }).then((r) => r.json());
      if (!d.access_token) throw new Error(d.error?.message || "Refresh failed");
      a.token = encrypt(d.access_token); a.tokenRefreshedAt = new Date();
      a.tokenExpiresAt = new Date(Date.now() + (Number(d.expires_in) || 60 * 86400) * 1000); a.lastError = "";
    } catch (e) { a.lastError = `Login renewal failed: ${e.message}. Reconnect this account.`; a.tokenRefreshedAt = new Date(); }
    await a.save();
  }
}
