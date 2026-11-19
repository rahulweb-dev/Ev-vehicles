// Publishing for SocialPost documents (scheduler + "publish now" + auto-post of new content).
import SocialPost from "@/lib/models/SocialPost";
import { getMetaConfig, postToFacebookPage, postToInstagram } from "./meta";

const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");

/** Publish one SocialPost to its platforms; records per-platform results. */
export async function publishSocialPost(post, cfg) {
  cfg = cfg || await getMetaConfig();
  // Claim it so two scheduler runs can't double-post
  const claimed = await SocialPost.findOneAndUpdate(
    { _id: post._id, status: { $in: ["draft", "scheduled", "failed", "partial"] } },
    { $set: { status: "publishing" } }, { returnDocument: "after" });
  if (!claimed) return null;
  if (claimed.accounts?.length) return publishAccountPost(claimed);

  const results = { ...(claimed.results?.toObject?.() || claimed.results || {}) };
  for (const p of claimed.platforms) {
    if (results[p]?.ok) continue; // already posted on a previous attempt
    try {
      const r = p === "facebook"
        ? await postToFacebookPage({ message: claimed.message, link: claimed.link, imageUrl: claimed.imageUrl }, cfg)
        : await postToInstagram({ caption: claimed.igCaption || claimed.message, imageUrl: claimed.imageUrl }, cfg);
      results[p] = { ok: true, postId: r.postId, permalink: r.permalink, error: "", at: new Date() };
    } catch (e) {
      results[p] = { ok: false, error: e.message, at: new Date() };
      console.error(`[social-post] ${p} failed for ${claimed._id}:`, e.message);
    }
  }
  const oks = claimed.platforms.filter((p) => results[p]?.ok).length;
  const status = oks === claimed.platforms.length ? "published" : oks ? "partial" : "failed";
  await SocialPost.updateOne({ _id: claimed._id }, { $set: { results, status } });
  return { id: String(claimed._id), status, results };
}

/** My Social post: publish to each of the owner's selected accounts. */
async function publishAccountPost(claimed) {
  const SocialAccount = (await import("@/lib/models/SocialAccount")).default;
  const { publishToAccount } = await import("./accounts");
  const accounts = await SocialAccount.find({ _id: { $in: claimed.accounts }, owner: claimed.owner });
  const prev = new Map((claimed.accountResults || []).map((r) => [String(r.account), r.toObject?.() || r]));
  const results = [];
  for (const id of claimed.accounts) {
    const a = accounts.find((x) => String(x._id) === String(id));
    const old = prev.get(String(id));
    if (old?.ok) { results.push(old); continue; }
    if (!a) { results.push({ account: id, platform: old?.platform || "", name: old?.name || "Removed account", ok: false, error: "Account was disconnected", at: new Date() }); continue; }
    try {
      const r = await publishToAccount(a, claimed);
      results.push({ account: a._id, platform: a.platform, name: a.username ? "@" + a.username : a.name, ok: true, postId: r.postId, permalink: r.permalink, error: "", at: new Date() });
    } catch (e) {
      results.push({ account: a._id, platform: a.platform, name: a.username ? "@" + a.username : a.name, ok: false, error: e.message, at: new Date() });
      console.error(`[social-post] account ${a._id} failed for ${claimed._id}:`, e.message);
    }
  }
  const oks = results.filter((r) => r.ok).length;
  const status = oks === results.length ? "published" : oks ? "partial" : "failed";
  await SocialPost.updateOne({ _id: claimed._id }, { $set: { accountResults: results, status } });
  return { id: String(claimed._id), status, accountResults: results };
}

/** Called by the scheduler cron: publish every scheduled post whose time has come. */
export async function publishDueSocialPosts() {
  const due = await SocialPost.find({ status: "scheduled", scheduledAt: { $lte: new Date() } }).sort({ scheduledAt: 1 }).limit(10).lean();
  if (!due.length) return [];
  const cfg = await getMetaConfig();
  const out = [];
  for (const p of due) out.push(await publishSocialPost(p, cfg));
  return out.filter(Boolean);
}

function hashtags(tags = []) {
  const base = tags.slice(0, 5).map((t) => "#" + String(t).replace(/[^A-Za-z0-9]/g, "")).filter((t) => t.length > 2);
  return [...new Set([...base, "#EV", "#ElectricVehicles", "#EVRadar"])].join(" ");
}

/**
 * Auto-post a newly published article or blog to the platforms that have auto-post on.
 * Creates a SocialPost (scheduled now) so it shows in the scheduler history; skips duplicates.
 */
export async function autoPostContent(doc, kind /* "article" | "blog" */) {
  const cfg = await getMetaConfig();
  const platforms = ["facebook", "instagram"].filter((p) => cfg[p].enabled && cfg[p].autoPost);
  if (!platforms.length || !doc?.image) return null;
  if (await SocialPost.exists({ "source.kind": kind, "source.refId": String(doc._id) })) return null;
  const url = `${SITE()}/${kind === "blog" ? "blogs" : "news"}/${doc.slug}`;
  const tags = hashtags(doc.tags);
  const post = await SocialPost.create({
    platforms,
    message: `⚡ ${doc.title}\n\n${doc.excerpt || ""}\n\n${tags}`,
    igCaption: `⚡ ${doc.title}\n\n${doc.excerpt || ""}\n\nRead the full story on evradar.in (link in bio).\n\n${tags}`,
    link: url, imageUrl: doc.image, scheduledAt: new Date(), status: "scheduled",
    source: { kind, refId: String(doc._id), slug: doc.slug },
  });
  return publishSocialPost(post, cfg);
}
