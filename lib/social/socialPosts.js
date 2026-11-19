// Publishing for SocialPost documents (scheduler + "publish now" + auto-post of new content).
import SocialPost from "@/lib/models/SocialPost";
import { getMetaConfig, postToFacebookPage, postToInstagram } from "./meta";
import { fbImage, igCard, contentLabel } from "./socialImages";

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
        ? await postToFacebookPage({ message: claimed.message, link: claimed.link, imageUrl: claimed.fbImageUrl || claimed.imageUrl }, cfg)
        : await postToInstagram({ caption: claimed.igCaption || claimed.message, imageUrl: claimed.igImageUrl || claimed.imageUrl }, cfg);
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
  for (const p of due) {
    const ready = await prepareContentPost(p);
    if (ready) out.push(await publishSocialPost(ready, cfg));
  }
  return out.filter(Boolean);
}

function hashtags(tags = []) {
  const base = tags.slice(0, 5).map((t) => "#" + String(t).replace(/[^A-Za-z0-9]/g, "")).filter((t) => t.length > 2);
  return [...new Set([...base, "#EV", "#ElectricVehicles", "#EVRadar"])].join(" ");
}

async function contentModel(kind) {
  return kind === "blog" ? (await import("@/lib/models/Blog")).default : (await import("@/lib/models/Article")).default;
}

/** Captions + platform-sized images for an article / buyer's guide. */
function contentFields(doc, kind) {
  const url = `${SITE()}/${kind === "blog" ? "blogs" : "news"}/${doc.slug}`;
  const tags = hashtags(doc.tags);
  const label = contentLabel(doc, kind);
  return {
    message: `⚡ ${doc.title}\n\n${doc.excerpt || ""}\n\n${tags}`,
    igCaption: `⚡ ${doc.title}\n\n${doc.excerpt || ""}\n\nRead the full ${kind === "blog" ? "guide" : "story"} on evradar.in (link in bio).\n\n${tags}`,
    link: url, imageUrl: doc.image,
    fbImageUrl: fbImage(doc.image), igImageUrl: igCard(doc.image, { title: doc.title, label }),
  };
}

async function autoPlatforms() {
  const cfg = await getMetaConfig();
  return { cfg, platforms: ["facebook", "instagram"].filter((p) => cfg[p].enabled && cfg[p].autoPost) };
}

/**
 * Auto-post a newly published article or blog to the platforms that have auto-post on.
 * If the post was already queued (scheduled article), refresh it and publish it now. Never duplicates.
 */
export async function autoPostContent(doc, kind /* "article" | "blog" */) {
  if (!doc?.image) return null;
  const existing = await SocialPost.findOne({ "source.kind": kind, "source.refId": String(doc._id) });
  if (existing) {
    if (existing.status !== "scheduled") return null; // already posted (or being posted)
    Object.assign(existing, contentFields(doc, kind), { scheduledAt: new Date() });
    await existing.save();
    return publishSocialPost(existing);
  }
  const { cfg, platforms } = await autoPlatforms();
  if (!platforms.length) return null;
  const post = await SocialPost.create({
    platforms, ...contentFields(doc, kind), scheduledAt: new Date(), status: "scheduled",
    source: { kind, refId: String(doc._id), slug: doc.slug },
  });
  return publishSocialPost(post, cfg);
}

/**
 * Queue Facebook/Instagram posts for every scheduled (future) article and guide, at the same time
 * the article goes live, so they show in the Social Scheduler. Keeps times in sync if an article is
 * rescheduled, and removes queued posts whose article was unscheduled or deleted.
 */
export async function syncScheduledContent() {
  const { platforms } = await autoPlatforms();
  const now = new Date();
  for (const kind of ["article", "blog"]) {
    const Model = await contentModel(kind);
    const docs = platforms.length
      ? await Model.find({ status: "draft", scheduledAt: { $gt: now, $ne: null }, image: { $nin: [null, ""] } }).select("title excerpt tags image slug category scheduledAt").limit(200).lean()
      : [];
    const queued = await SocialPost.find({ "source.kind": kind, status: "scheduled" });
    const byRef = new Map(queued.map((p) => [p.source.refId, p]));
    for (const d of docs) {
      const p = byRef.get(String(d._id));
      if (!p) {
        if (await SocialPost.exists({ "source.kind": kind, "source.refId": String(d._id) })) continue;
        await SocialPost.create({ platforms, ...contentFields(d, kind), scheduledAt: d.scheduledAt, status: "scheduled", source: { kind, refId: String(d._id), slug: d.slug } });
      } else if (+p.scheduledAt !== +d.scheduledAt) {
        p.scheduledAt = d.scheduledAt; Object.assign(p, contentFields(d, kind)); await p.save();
      }
    }
    // Drop queued posts whose article is no longer scheduled or published (deleted / unscheduled)
    const stale = queued.filter((p) => !docs.some((d) => String(d._id) === p.source.refId));
    for (const p of stale) {
      const d = await Model.findById(p.source.refId).select("status scheduledAt").lean();
      if (!d || (d.status !== "published" && !d.scheduledAt)) await SocialPost.deleteOne({ _id: p._id, status: "scheduled" });
    }
  }
}

/** Before publishing a queued article post: make sure the article is live and use its latest title/image. */
async function prepareContentPost(p) {
  const kind = p.source?.kind;
  if (kind !== "article" && kind !== "blog") return p;
  const d = await (await contentModel(kind)).findById(p.source.refId).lean();
  if (!d) { await SocialPost.deleteOne({ _id: p._id }); return null; }
  if (d.status !== "published") {
    if (d.scheduledAt && d.scheduledAt > new Date()) await SocialPost.updateOne({ _id: p._id }, { $set: { scheduledAt: d.scheduledAt } });
    return null; // wait until the article itself is live
  }
  const fields = contentFields(d, kind);
  await SocialPost.updateOne({ _id: p._id }, { $set: fields });
  return { ...p, ...fields };
}
