import Article                     from "@/lib/models/Article";
import { uploadToImageKit }        from "@/lib/imagekit";
import { sanitizeArticleContent }  from "@/lib/sanitize";

/*
 * AI news desk.
 * 1. Pull fresh EV headlines from Google News RSS (cars, 2W, commercial, charging, policy).
 * 2. Skip stories we've already covered.
 * 3. Gemini + Google Search grounding writes an ORIGINAL article (source is only used for facts).
 * 4. Gemini generates a cover image → ImageKit (resized/WebP via URL transform).
 * 5. Saved as a draft scheduled AUTO_NEWS_DELAY_MIN (default 60) minutes out; the scheduler publishes it.
 */

const GEMINI_API   = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL   = process.env.AUTO_NEWS_TEXT_MODEL  || "gemini-flash-latest";
const BACKUP_MODEL = process.env.AUTO_NEWS_BACKUP_MODEL || "gemini-flash-lite-latest";
const IMAGE_MODEL  = process.env.AUTO_NEWS_IMAGE_MODEL || "gemini-3.1-flash-image";
const AUTHOR       = process.env.AUTO_NEWS_AUTHOR      || "EV Radar News Desk";
const DELAY_MIN    = Number(process.env.AUTO_NEWS_DELAY_MIN || 60);
const MIN_WORDS    = Number(process.env.AUTO_NEWS_MIN_WORDS || 350);
const SITE_URL     = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");

// Rotated hour by hour so the feed stays mixed: personal + commercial + infra + global.
const FEEDS = [
  { category: "cars",       q: "electric car India launch OR price OR range" },
  { category: "bikes",      q: "electric scooter OR electric motorcycle India" },
  { category: "commercial", q: "electric bus OR electric truck OR electric three-wheeler OR e-rickshaw India" },
  { category: "charging",   q: "EV charging station OR battery swapping India" },
  { category: "cars",       q: "EV policy OR PM E-DRIVE OR EV subsidy India" },
  { category: "commercial", q: "electric commercial vehicle OR EV fleet OR electric logistics" },
  { category: "cars",       q: "electric vehicle global Tesla OR BYD OR Hyundai OR Tata EV" },
  { category: "bikes",      q: "Ola Electric OR Ather OR TVS iQube OR Bajaj Chetak OR Hero Vida" },
];

const timeout = (ms) => AbortSignal.timeout(ms);

// Search matches are loose (a petrol scooter discount matches "scooter") — headline itself must be about EVs
const EV_HEADLINE = /\b(?:electric|EVs?|e-?(?:bus|truck|scooter|bike|rickshaw|auto|motorcycle|SUV|car|2W|3W|4W)s?|battery|batteries|charging|charger|hydrogen|fuel cell|swapping|PM E-DRIVE|FAME|Tesla|BYD|Ather|Ola Electric|iQube|Chetak|Vida|Ultraviolette|Simple Energy|Euler|Statiq|Tata\.ev|kWh|\d+\s?km range|range of \d+\s?km|ePod|EX30|EX40|EX90|EC40|EQ[ABCS]|iX\d?|XEV ?9e|BE ?6|eVitara|e Vitara|Windsor|Comet|Atto ?3|Sealion|eMAX|Curvv\.ev)\b/i;

/* ── RSS ─────────────────────────────────────────────────────────────── */

function decodeEntities(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(m[1]).trim() : "";
}

async function fetchFeed({ q, category }) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${q} when:2d`)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const res = await fetch(url, { signal: timeout(8000), headers: { "User-Agent": "Mozilla/5.0 EVRadarBot" } });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xml = await res.text();

  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const sourceName = tag(item, "source");
    let title = tag(item, "title");
    // Google appends " - Publisher" to every headline
    if (sourceName && title.endsWith(` - ${sourceName}`)) title = title.slice(0, -(sourceName.length + 3));
    return {
      title,
      link:        tag(item, "link"),
      pubDate:     new Date(tag(item, "pubDate") || Date.now()),
      sourceName,
      snippet:     tag(item, "description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category,
    };
  }).filter(i => i.title && i.link);
}

export function sourceKeyFor(title) {
  return title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 2).slice(0, 12).join(" ");
}

// Word-overlap similarity — stops us writing the same story twice from two publishers.
function similar(a, b) {
  const A = new Set(a.split(" ")), B = new Set(b.split(" "));
  const shared = [...A].filter(w => B.has(w)).length;
  return shared / Math.max(1, Math.min(A.size, B.size));
}

async function pickStory(feedIndex) {
  const recent = await Article.find({ aiGenerated: true, createdAt: { $gte: new Date(Date.now() - 7 * 864e5) } })
    .select("sourceKey").lean();
  const recentKeys = recent.map(r => r.sourceKey).filter(Boolean);

  // Try the feed for this slot first, then the others
  for (let n = 0; n < FEEDS.length; n++) {
    const feed = FEEDS[(feedIndex + n) % FEEDS.length];
    let items;
    try { items = await fetchFeed(feed); } catch (e) { console.warn("[autoNews] feed failed", feed.q, e.message); continue; }

    const fresh = items
      .filter(i => Date.now() - i.pubDate.getTime() < 2 * 864e5)
      .sort((a, b) => b.pubDate - a.pubDate);

    for (const item of fresh.filter(i => EV_HEADLINE.test(i.title))) {
      const key = sourceKeyFor(item.title);
      if (recentKeys.some(k => k === key || similar(k, key) > 0.6)) continue;
      if (await Article.exists({ sourceKey: key })) continue;
      return { ...item, sourceKey: key };
    }
  }
  return null;
}

/* ── Gemini ──────────────────────────────────────────────────────────── */

function extractJson(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape)                  { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"')              { inString = !inString; continue; }
    if (inString)                continue;
    if (ch === "{")              depth++;
    else if (ch === "}") { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

async function writeArticle(story, apiKey, grounded = true, model = TEXT_MODEL) {
  const research = grounded
    ? "A news story is breaking. Use Google Search to research it from multiple sources, then write a completely ORIGINAL article in your own words."
    : "A news story is breaking. You have only the headline and snippet below — rely on them for facts and your general EV-industry knowledge for background context only. Write a completely ORIGINAL article in your own words.";
  const prompt = `You are a senior journalist at EVRadar.in, an Indian electric-vehicle news site.

${research}

Story headline: ${story.title}
Reported by: ${story.sourceName}
Snippet: ${story.snippet}
Section: ${story.category}

Hard rules:
- Do NOT copy or closely paraphrase sentences from any source. Write a new headline, new structure, new wording.
- Only state facts (prices, specs, dates, numbers, quotes) you can confirm${grounded ? " via search" : " from the snippet"}. If a detail is unconfirmed, leave it out — never invent numbers.
- Add value the source didn't: explain what it means for Indian EV buyers / fleet operators, compare with rivals or past figures, and give context.
- No quotes longer than one short sentence, always attributed.
- Indian English. Prices in ₹ (lakh/crore) where relevant.
- 550–800 words. HTML using only <h2>, <h3>, <p>, <ul>, <li>, <strong>, <table>, <tr>, <th>, <td>. No <h1>.

Write like an experienced Indian auto reporter, not like an AI:
- Open with the news itself in the first sentence — who did what, how much, when. No scene-setting or "India's EV sector is..." openers.
- Mix short and long sentences. Use plain words. Contractions are fine. An occasional opinionated line is fine ("That's a big jump for a company this size.").
- Specific beats general: names, numbers, places, model names. Cut any sentence that could appear in any EV article.
- Headings should be specific to this story (e.g. "Why Purple Bus is betting on Bengaluru–Hyderabad"), never generic like "Key Highlights", "Conclusion", "Overview" or "The Road Ahead".
- At most one bullet list, only if it genuinely helps (specs, prices). Don't start bullets with bold labels and colons.
- No closing summary paragraph. End on a concrete fact, a next step, or what to watch for.
- NEVER use these words/phrases: delve, landscape, pivotal, game-changer, game changer, testament, realm, navigate, seamless, robust, boasts, notably, moreover, furthermore, additionally, in conclusion, overall, it's worth noting, it is important to note, in today's, ever-evolving, rapidly evolving, revolutionise, paving the way, a significant step, poised to, quietly, landmark, unprecedented, embark, unlock, elevate, harness, synergy, cutting-edge, crucial, vital, transformative, journey.
- Don't use em dashes (—). Use commas or full stops.
- Don't mention AI, yourself, or that this is a rewrite.

Return ONLY JSON, no markdown fences:
{
  "title": "Specific news headline like a newspaper would run, under 70 chars, no colon-style 'X: Y' format",
  "excerpt": "One-sentence summary under 155 chars",
  "content": "HTML body",
  "category": "cars | bikes | commercial | charging",
  "tags": ["5-7 tags: brand, model, topic, 'EV India'"],
  "metaTitle": "under 60 chars",
  "metaDescription": "120-155 chars",
  "faqs": [{"question": "...", "answer": "..."}],
  "imageAlt": "Short literal description of the cover photo for alt text",
  "imagePrompt": "Describe a photorealistic editorial cover photo for this story (scene, vehicle type, setting in India, lighting). No text, no logos, no brand badges, no real people's faces."
}
Give exactly 3 FAQs.`;

  const res = await fetch(`${GEMINI_API}/${model}:generateContent?key=${apiKey}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    signal:  timeout(32000),
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...(grounded && { tools: [{ google_search: {} }] }),
      generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
    }),
  });
  // Search grounding is billed separately — fall back to ungrounded writing if it's rate-limited
  if (grounded && (res.status === 429 || res.status === 400)) {
    console.warn("[autoNews] grounding unavailable, writing from snippet:", res.status);
    return writeArticle(story, apiKey, false, model);
  }
  // Model overloaded — retry once on the lighter model
  if ((res.status === 503 || res.status === 500) && model !== BACKUP_MODEL) {
    console.warn("[autoNews] model busy, retrying on", BACKUP_MODEL);
    return writeArticle(story, apiKey, grounded, BACKUP_MODEL);
  }
  if (!res.ok) throw new Error(`Gemini text ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
  const json = extractJson(text);
  if (!json) throw new Error("Gemini returned no JSON");
  return JSON.parse(json);
}

async function generateCover(imagePrompt, slug, apiKey) {
  const prompt = `${imagePrompt}

Style: high-quality photorealistic editorial news photograph, 16:9, natural colours, shallow depth of field. Absolutely no text, captions, watermarks, logos or number plates.`;

  const res = await fetch(`${GEMINI_API}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    signal:  timeout(20000),
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
    }),
  });
  if (!res.ok) throw new Error(`Gemini image ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = await res.json();
  const part = (data.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  if (!part) throw new Error("Gemini returned no image");

  const ext = (part.inlineData.mimeType || "image/png").split("/")[1] || "png";
  const uploaded = await uploadToImageKit(Buffer.from(part.inlineData.data, "base64"), `${slug}.${ext}`, "/ev-news/ai");
  // ImageKit resizes + converts on delivery — no sharp needed (its native binary fails to load on Vercel)
  return `${uploaded.url}?tr=w-1280,h-720,c-maintain_ratio,f-webp,q-80`;
}

/* ── Main ────────────────────────────────────────────────────────────── */

// Safety net for AI tells the prompt didn't catch
const PHRASE_SWAPS = [
  [/\bIt(?:'s| is) (?:worth noting|important to note) that\s*/gi, ""],
  [/\b(?:Moreover|Furthermore|Additionally),\s*/g, "Also, "],
  [/\bIn conclusion,\s*/gi, ""],
  [/\bdelve(s|d)? into\b/gi, "look$1 at"],
  [/\bgame[- ]changer\b/gi, "big shift"],
  [/\bpivotal\b/gi, "key"],
  [/\bseamless(ly)?\b/gi, "smooth$1"],
  [/\brobust\b/gi, "strong"],
  [/\bboasts\b/gi, "has"],
  [/\bpoised to\b/gi, "set to"],
  [/\bpaving the way for\b/gi, "opening the door to"],
  [/\bcutting-edge\b/gi, "latest"],
  [/\b(?:vital|crucial)\b/gi, "key"],
  [/\s*—\s*/g, ", "],
];

function humanise(text = "") {
  let out = text;
  for (const [re, to] of PHRASE_SWAPS) out = out.replace(re, to);
  // Re-capitalise sentence starts the removals may have left lower-case
  return out.replace(/(<p>|[.!?]\s+)([a-z])/g, (_, a, b) => a + b.toUpperCase());
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
}

const CATEGORIES = ["cars", "bikes", "commercial", "charging"];

// Generates one article and schedules it. Caller must dbConnect() first.
export async function generateAutoNewsArticle({ feedIndex = new Date().getUTCHours() } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const story = await pickStory(feedIndex % FEEDS.length);
  if (!story) return { skipped: true, reason: "No new stories found" };

  const g = await writeArticle(story, apiKey);
  if (!g.title || !g.content) throw new Error("Generated article is missing title/content");

  const baseSlug = slugify(g.title);
  let slug = baseSlug;
  for (let n = 1; await Article.exists({ slug }); n++) slug = `${baseSlug}-${n}`;

  const category = CATEGORIES.includes(g.category) ? g.category : story.category;

  let image;
  try {
    image = await generateCover(g.imagePrompt || g.title, slug, apiKey);
  } catch (e) {
    console.warn("[autoNews] image generation failed, using OG card:", e.message);
    image = `${SITE_URL}/api/og?title=${encodeURIComponent(g.title)}&tag=${encodeURIComponent(category)}&type=article`;
  }

  // Queue behind any AI article still waiting, so they go out one per DELAY_MIN
  const lastQueued = await Article.findOne({ aiGenerated: true, status: "draft", scheduledAt: { $ne: null } })
    .sort({ scheduledAt: -1 }).select("scheduledAt").lean();
  const base = Math.max(Date.now(), lastQueued?.scheduledAt?.getTime() || 0);
  const scheduledAt = new Date(base + DELAY_MIN * 60_000);

  const words = g.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  // Thin pages hurt the whole site in Google — short ones wait for a human instead of auto-publishing
  const autoPublish = words >= MIN_WORDS;

  const article = await Article.create({
    title:           humanise(g.title).slice(0, 120),
    slug,
    excerpt:         (g.excerpt || g.metaDescription || g.title).slice(0, 300),
    content:         sanitizeArticleContent(humanise(g.content)),
    image,
    imageAlt:        g.imageAlt || humanise(g.title),
    category,
    author:          AUTHOR,
    tags:            (g.tags || []).slice(0, 8),
    readTime:        `${Math.max(2, Math.round(words / 200))} min`,
    status:          "draft",
    scheduledAt:     autoPublish ? scheduledAt : null,
    metaTitle:       (g.metaTitle || g.title).slice(0, 70),
    metaDescription: (g.metaDescription || g.excerpt || "").slice(0, 160),
    faqs:            Array.isArray(g.faqs) ? g.faqs.filter(f => f?.question && f?.answer).slice(0, 5) : [],
    aiGenerated:     true,
    sourceUrl:       story.link,
    sourceName:      story.sourceName,
    sourceKey:       story.sourceKey,
  });

  return {
    created: true,
    article: { _id: article._id, slug, title: article.title, category, words, image, scheduledAt: autoPublish ? scheduledAt : null },
    ...(!autoPublish && { note: `Only ${words} words — saved as draft for review, not scheduled` }),
    source:  { title: story.title, name: story.sourceName },
  };
}
