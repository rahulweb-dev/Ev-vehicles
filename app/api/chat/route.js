export const runtime = "nodejs";

import { rateLimit, getIp } from "@/lib/rateLimit";
const chatLimiter = rateLimit({ windowMs: 60_000, max: 15 });

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-flash-latest";

// 5-minute in-memory context cache keyed by query hash
const contextCache = new Map();
const CTX_TTL = 5 * 60_000;

function hashQuery(q) {
  let h = 0;
  for (let i = 0; i < q.length; i++) { h = Math.imul(31, h) + q.charCodeAt(i) | 0; }
  return h.toString(36);
}

/* ─── Build system prompt with DB context ──────────────────────── */
function buildSystemPrompt(context) {
  return `You are EVRadar AI, India's premier electric vehicle assistant on EVRadar.in — India's #1 EV news platform.

You help users with:
• EV recommendations (cars, bikes, scooters) based on budget and needs
• EV comparisons and spec analysis
• Charging infrastructure, costs, and time
• Battery technology, BMS, range, degradation
• Government subsidies (FAME II, state EV policies, road tax exemptions)
• Upcoming EV launches in India
• Latest EV news and reviews

Guidelines:
- Be friendly, concise, and expert. Max 180 words per response.
- Always use Indian context: ₹ currency, lakh notation (e.g. ₹12.5 lakh), Indian cities.
- When recommending vehicles, mention price, certified range, and 1-2 standout features.
- When users mention budget, always respond with 2-3 specific EV options.
- Reference EVRadar pages using markdown links: [Vehicle Name](/cars/slug) or [Article Title](/news/slug)
- Format lists with • bullets. Use **bold** for vehicle names and prices.
- For charging cost: assume ₹8/unit average, then calculate based on battery size.
- If asked about news, summarize the EVRadar articles below.
- When you detect purchase intent, acknowledge it warmly and say an EV expert can help with a test drive.
- End responses with a brief follow-up question to keep conversation going.
- Never make up prices or specs — only use what's in the EVRadar database below.

EVRadar Database (prioritize this over general knowledge):
${context || "No specific EVRadar content matched this query — use general EV knowledge."}

Today: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`;
}

/* ─── Fetch relevant content from MongoDB ───────────────────────── */
async function getDbContext(query) {
  const key = hashQuery(query.toLowerCase().slice(0, 120));
  const cached = contextCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.ctx;

  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();

    /* keyword extraction — words > 3 chars */
    const stopWords = new Set(["what","which","best","good","tell","about","give","some","with","that","this","have","from","they","will","would","could"]);
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    const regexSource = words.length > 0
      ? words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
      : ".";
    const regex = new RegExp(regexSource, "i");

    const [articles, vehicles] = await Promise.all([
      Article.find({
        status: "published",
        $or: [{ title: regex }, { excerpt: regex }, { tags: regex }],
      })
        .select("title excerpt slug publishedAt")
        .sort({ publishedAt: -1 })
        .limit(4)
        .lean(),

      Vehicle.find({
        status: "published",
        $or: [{ name: regex }, { brand: regex }, { shortDescription: regex }],
      })
        .select("name brand slug vehicleType variants performance charging")
        .limit(4)
        .lean(),
    ]);

    let ctx = "";

    if (articles.length > 0) {
      ctx += "### Recent EVRadar Articles\n";
      for (const a of articles) {
        ctx += `- **${a.title}**: ${a.excerpt || ""} → /news/${a.slug}\n`;
      }
      ctx += "\n";
    }

    if (vehicles.length > 0) {
      ctx += "### EVRadar Vehicle Database\n";
      for (const v of vehicles) {
        const price     = v.variants?.[0]?.exShowroomPrice || "TBA";
        const priceMax  = v.variants?.[v.variants.length - 1]?.exShowroomPrice;
        const priceStr  = priceMax && priceMax !== price ? `${price} – ${priceMax}` : price;
        const range     = v.performance?.drivingRange || v.variants?.[0]?.range || "—";
        const power     = v.performance?.power || "—";
        const fastChg   = v.charging?.fastCharging ? "Fast charging: Yes" : "";
        const type      = v.vehicleType === "car" ? "cars" : "bikes";
        ctx += `- **${v.brand} ${v.name}** (${v.vehicleType}): ${priceStr} ex-showroom | Range: ${range} | Power: ${power} ${fastChg} → /${type}/${v.slug}\n`;
      }
    }

    /* always fetch latest 3 articles for news queries */
    if (/news|latest|today|recent|update/i.test(query)) {
      const latest = await Article.find({ status: "published" })
        .select("title excerpt slug publishedAt")
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean();
      if (latest.length > 0 && !ctx.includes("Recent EVRadar Articles")) {
        ctx += "\n### Latest EVRadar News\n";
        for (const a of latest) {
          ctx += `- **${a.title}** → /news/${a.slug}\n`;
        }
      }
    }

    const result = ctx || "";
    contextCache.set(key, { ctx: result, expiresAt: Date.now() + CTX_TTL });
    return result;
  } catch (err) {
    console.error("[chat] DB context error:", err.message);
    return "";
  }
}

/* ─── POST /api/chat ────────────────────────────────────────────── */
export async function POST(req) {
  const rl = chatLimiter.check(getIp(req));
  if (!rl.ok) {
    return Response.json(
      { error: "Too many messages. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY not set. Get a free key from aistudio.google.com/apikey" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, history = [], sessionId } = body;
  if (!message?.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const context = await getDbContext(message);

  // Convert history to Gemini format (user/model roles)
  const contents = [
    ...history
      .filter(m => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    { role: "user", parts: [{ text: message.trim() }] },
  ];

  try {
    const geminiRes = await fetch(
      `${GEMINI_API}/${GEMINI_MODEL}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt(context) }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      const msg = err?.error?.message || `Gemini error ${geminiRes.status}`;
      console.error("[chat] Gemini error:", msg);
      return Response.json({ error: msg }, { status: geminiRes.status });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (!raw || raw === "[DONE]") continue;
              try {
                const chunk = JSON.parse(raw);
                const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (text) controller.enqueue(encoder.encode(text));
              } catch {}
            }
          }
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    if (sessionId) persistHistory(sessionId, message, req).catch(() => {});

    return new Response(readable, {
      headers: {
        "Content-Type":      "text/plain; charset=utf-8",
        "Cache-Control":     "no-cache, no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[chat] AI error:", err.message);
    return Response.json(
      { error: "AI service temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}

async function persistHistory(sessionId, message, req) {
  try {
    const dbConnect  = (await import("@/lib/mongodb")).default;
    const ChatHistory = (await import("@/lib/models/ChatHistory")).default;
    await dbConnect();
    await ChatHistory.findOneAndUpdate(
      { sessionId },
      {
        $push: { messages: { role: "user", content: message } },
        $setOnInsert: { userAgent: req.headers.get("user-agent") || "" },
      },
      { upsert: true }
    );
  } catch {}
}
