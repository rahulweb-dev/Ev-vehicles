import dbConnect        from "@/lib/mongodb";
import Article          from "@/lib/models/Article";
import SocialSettings   from "@/lib/models/SocialSettings";
import { decrypt }      from "@/lib/encrypt";
import { postToFacebook }  from "./facebook";
import { postToLinkedIn }  from "./linkedin";
import { postToPinterest } from "./pinterest";
import { postToTelegram }  from "./telegram";

const HANDLERS = {
  facebook:  postToFacebook,
  linkedin:  postToLinkedIn,
  pinterest: postToPinterest,
  telegram:  postToTelegram,
};

/** Decrypt every credential field in a settings document */
function decryptCreds(rawCreds = {}) {
  const out = {};
  for (const [k, v] of Object.entries(rawCreds)) {
    out[k] = v ? decrypt(v) : "";
  }
  return out;
}

/**
 * Publish an article to one or more social platforms.
 *
 * @param {string}   articleId  MongoDB ObjectId string
 * @param {string[]} targets    Platforms to publish to. If empty, all enabled platforms are used.
 * @returns {Array<{ platform: string, success: boolean, postId?: string, error?: string }>}
 */
export async function publishToSocial(articleId, targets = []) {
  await dbConnect();

  const [article, allSettings] = await Promise.all([
    Article.findById(articleId).lean(),
    SocialSettings.find({ enabled: true }).lean(),
  ]);

  if (!article) throw new Error("Article not found");

  // Build a map: platform → decrypted credentials
  const credsMap = Object.fromEntries(
    allSettings.map((s) => [s.platform, decryptCreds(s.credentials?.toObject?.() ?? s.credentials)])
  );

  // Resolve which platforms to actually publish to
  const toPublish = (targets.length > 0 ? targets : Object.keys(HANDLERS))
    .filter((p) => HANDLERS[p] && credsMap[p]);

  if (toPublish.length === 0) return [];

  // Run all publishers concurrently, collect settled results
  const settled = await Promise.allSettled(
    toPublish.map((platform) => HANDLERS[platform](article, credsMap[platform]))
  );

  // Build $set update for socialStatus
  const $set = {};
  const report = [];

  settled.forEach((result, i) => {
    const platform = toPublish[i];

    if (result.status === "fulfilled") {
      const { postId = "", messageId = "" } = result.value ?? {};
      $set[`socialStatus.${platform}`] = {
        published:   true,
        postId:      postId || messageId,
        messageId:   messageId,
        publishedAt: new Date(),
        error:       "",
      };
      report.push({ platform, success: true, postId: postId || messageId });
    } else {
      const errMsg = result.reason?.message || "Unknown error";
      $set[`socialStatus.${platform}`] = {
        published:   false,
        postId:      "",
        messageId:   "",
        publishedAt: null,
        error:       errMsg,
      };
      report.push({ platform, success: false, error: errMsg });
      console.error(`[social] ${platform} failed for article ${articleId}:`, result.reason);
    }
  });

  // Persist all outcomes in one write
  await Article.findByIdAndUpdate(articleId, { $set });

  return report;
}
