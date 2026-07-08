/**
 * Generate a platform-optimised image URL from an ImageKit source URL.
 *
 * ImageKit applies transforms via the ?tr= query param — no re-upload needed.
 * fo-auto = smart "focus on auto" crop (keeps the subject in frame).
 *
 * Sizes chosen for best engagement on each platform:
 *  Facebook  1200×630  (1.91:1 — Open Graph standard)
 *  Instagram 1080×1080 (1:1   — square feed, best reach)
 *  LinkedIn  1200×627  (1.91:1 — company update)
 *  Pinterest 1000×1500 (2:3   — tall pin, highest saves)
 *  Telegram  1280×720  (16:9  — link preview thumbnail)
 */

const PLATFORM_SIZES = {
  facebook:  { w: 1200, h: 630  },
  instagram: { w: 1080, h: 1080 },
  linkedin:  { w: 1200, h: 627  },
  pinterest: { w: 1000, h: 1500 },
  telegram:  { w: 1280, h: 720  },
};

const IK_ENDPOINT = (process.env.IMAGEKIT_URL_ENDPOINT || "").replace(/\/$/, "");

/**
 * Returns a resized ImageKit URL for the given platform.
 * Falls back to the original URL if the image isn't hosted on ImageKit.
 *
 * @param {string} imageUrl   Original article image URL
 * @param {string} platform   "facebook" | "instagram" | "linkedin" | "pinterest" | "telegram"
 * @returns {string}
 */
export function getPlatformImage(imageUrl, platform) {
  if (!imageUrl) return "";

  const size = PLATFORM_SIZES[platform];
  if (!size) return imageUrl;

  // Only transform ImageKit-hosted images
  const isImageKit =
    IK_ENDPOINT && imageUrl.startsWith(IK_ENDPOINT);

  if (!isImageKit) {
    // Not on ImageKit — return original and let the platform crop it
    return imageUrl;
  }

  // Strip any existing ?tr= param, then append the platform transform
  const base = imageUrl.split("?")[0];
  return `${base}?tr=w-${size.w},h-${size.h},fo-auto,q-85,f-jpg`;
}
