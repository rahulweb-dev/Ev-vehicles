// Platform-sized images for social posts, generated on the fly by ImageKit transformations.
//  Facebook: 1200×630 (1.91:1) — the size Facebook shows full-width in the feed.
//  Instagram: 1080×1350 (4:5) — the tallest feed format; photo on top + headline card below.
const isImageKit = (u) => /ik\.imagekit\.io/.test(u || "");
const b64url = (s) => Buffer.from(s, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
// ImageKit's text font has no ₹ glyph; keep overlays to plain characters
const clean = (s) => String(s || "").replace(/₹\s?/g, "Rs ").replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

export function fbImage(url) {
  if (!isImageKit(url)) return url;
  return `${url.split("?")[0]}?tr=w-1200,h-630,fo-auto,f-jpg,q-90`;
}

const enc = (s) => encodeURIComponent(b64url(s));

/**
 * Card layout shared by Instagram and Pinterest: the photo fills the top ~65%, a green accent line,
 * then a compact dark panel with a category pill, the headline (font sized to its length) and a footer.
 * Note: ImageKit text "lh" (line height) only accepts integers — a decimal breaks the whole transform.
 */
function card(url, { title, label, W, H, photoH, maxChars, sizes }) {
  if (!isImageKit(url)) return url;
  let t = clean(title);
  if (t.length > maxChars) t = t.slice(0, maxChars - 3).replace(/\s+\S*$/, "") + "…";
  const fs = t.length > 95 ? sizes[2] : t.length > 65 ? sizes[1] : sizes[0];
  const tr = [
    `w-${W},h-${photoH},fo-auto`,
    `w-${W},h-${H},cm-pad_resize,bg-0B1220,fo-top`,
    `l-image,i-ik_canvas,bg-22C55E,w-${W},h-8,lx-0,ly-${photoH},l-end`,
    `l-text,ie-${enc(" EV RADAR ")},fs-26,co-FFFFFF,bg-0B1220,pa-10_18,r-12,tg-b,lx-48,ly-44,l-end`,
    `l-text,ie-${enc(" " + clean(label).toUpperCase() + " ")},fs-24,co-0B1220,bg-22C55E,pa-8_16,r-10,tg-b,lx-60,ly-${photoH + 42},l-end`,
    `l-text,ie-${enc(t)},fs-${fs},co-FFFFFF,tg-b,ia-left,w-${W - 120},lx-60,ly-${photoH + 102},l-end`,
    `l-text,ie-${enc("Read the full story on evradar.in")},fs-28,co-94A3B8,tg-b,lx-60,ly-${H - 72},l-end`,
    "f-jpg,q-90",
  ].join(":");
  return `${url.split("?")[0]}?tr=${tr}`;
}

/** Instagram 1080×1350 (4:5). */
export function igCard(url, { title = "", label = "EV NEWS" } = {}) {
  return card(url, { title, label, W: 1080, H: 1350, photoH: 880, maxChars: 120, sizes: [64, 56, 50] });
}

/** Pinterest 1000×1500 (2:3) — taller photo, same layout. */
export function pinCard(url, { title = "", label = "EV NEWS" } = {}) {
  return card(url, { title, label, W: 1000, H: 1500, photoH: 1000, maxChars: 130, sizes: [62, 54, 48] });
}

const LABELS = { cars: "Electric car news", bikes: "Electric two-wheeler news", commercial: "Commercial EV news", charging: "EV charging news", policy: "EV policy news" };
export function contentLabel(doc, kind) {
  if (kind === "blog") return "EV buyer's guide";
  return LABELS[doc.category] || "EV news";
}
