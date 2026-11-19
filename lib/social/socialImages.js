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

export function igCard(url, { title = "", label = "EV NEWS" } = {}) {
  if (!isImageKit(url)) return url;
  let t = clean(title);
  if (t.length > 120) t = t.slice(0, 117).replace(/\s+\S*$/, "") + "…";
  const fs = t.length > 85 ? 46 : 54;
  const tr = [
    "w-1080,h-720,fo-auto",
    "w-1080,h-1350,cm-pad_resize,bg-0B1220,fo-top",
    `l-text,ie-${encodeURIComponent(b64url(clean(label).toUpperCase()))},fs-28,co-22C55E,tg-b,lx-60,ly-770,l-end`,
    `l-text,ie-${encodeURIComponent(b64url(t))},fs-${fs},co-FFFFFF,tg-b,ia-left,w-960,lx-60,ly-820,l-end`,
    `l-text,ie-${encodeURIComponent(b64url("evradar.in"))},fs-30,co-94A3B8,tg-b,lx-60,ly-1270,l-end`,
    "f-jpg,q-90",
  ].join(":");
  return `${url.split("?")[0]}?tr=${tr}`;
}

const LABELS = { cars: "Electric car news", bikes: "Electric two-wheeler news", commercial: "Commercial EV news", charging: "EV charging news", policy: "EV policy news" };
export function contentLabel(doc, kind) {
  if (kind === "blog") return "EV buyer's guide";
  return LABELS[doc.category] || "EV news";
}
