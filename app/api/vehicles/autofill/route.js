import { requireAuth } from "@/lib/auth";

export const maxDuration = 60;

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

// Find the first complete JSON object in a string by matching braces
function extractJson(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape)            { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"')        { inString = !inString; continue; }
    if (inString)          continue;
    if (ch === "{")        depth++;
    else if (ch === "}") { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}
const GEMINI_MODEL = "gemini-flash-latest";

const SYSTEM_PROMPT = `You are a precise Indian electric vehicle database. You have detailed knowledge of every EV sold or announced in India.

STRICT RULES:
- Return ONLY valid JSON. No markdown, no text, no explanation whatsoever.
- Only include data you are CERTAIN about. If unsure about a specific value, use "" (empty string).
- NEVER guess or fabricate prices, range figures, or specs. Real data only.
- All prices in Indian Rupees format: "₹14,49,000" (use comma separators).
- Range figures must be ARAI certified figures for Indian market, not WLTP or EPA.
- Variant names must match official India launch names (e.g. "MR", "LR", "Max", "Air", "Prime").`;

function buildPrompt(name, vehicleType) {
  const label = vehicleType === "commercial" ? "electric commercial vehicle (truck/bus/van)"
    : vehicleType === "bike" ? "electric bike/scooter"
    : "electric car";
  return `You are filling a vehicle database for the Indian EV website evradar.in.

Provide ACCURATE information for the Indian ${label}: "${name}"

IMPORTANT: Use REAL official data only. If you are not confident about a value, use "" or []. Do NOT guess.

Return a JSON object with EXACTLY this structure:

{
  "name": "${name}",
  "brand": "",
  "shortDescription": "2-3 sentence summary (max 200 chars)",
  "description": "<p>2-3 paragraph HTML description.</p>",
  "availability": "available",
  "category": "popular",
  "variants": [
    { "name": "Variant name", "exShowroomPrice": "₹XX,XX,XXX", "onRoadPrice": "₹XX,XX,XXX", "batteryCapacity": "XX kWh", "range": "XXX km", "availabilityStatus": "Available", "features": [] }
  ],
  "performance": { "batteryCapacity": "", "drivingRange": "", "power": "", "peakPower": "", "torque": "", "topSpeed": "", "acceleration": "", "driveType": "", "batteryType": "" },
  "charging": { "acChargingTime": "", "dcChargingTime": "", "fastCharging": true, "chargingPort": "" },
  "specs": { "length": "", "width": "", "height": "", "wheelbase": "", "groundClearance": "", "kerbWeight": "", "seatingCapacity": "", "bootSpace": "", "tyreType": "", "wheelSize": "" },
  "keyFeatures": { "touchscreen": true, "instrumentCluster": true, "navigation": true, "bluetooth": true, "androidAuto": true, "appleCarPlay": true, "otaUpdates": false, "cruiseControl": false, "keylessEntry": false, "sunroof": false, "ventilatedSeats": false, "wirelessCharging": false },
  "features": { "infotainment": [], "connectivity": [], "comfort": [], "technology": [] },
  "safety": { "airbags": "", "abs": true, "ebd": true, "esc": true, "tractionControl": true, "tpms": true, "hillHoldAssist": true, "reverseCamera": true, "parkingSensors": true, "adasFeatures": [], "safetyRating": "", "additionalEquipment": [] },
  "warranty": { "vehicle": "", "battery": "", "motor": "", "roadsideAssistance": "" },
  "pros": [],
  "cons": [],
  "colors": [{ "name": "", "hexCode": "#000000" }],
  "metaTitle": "${name} Price in India 2026 – Range, Specs & Features | EV Radar",
  "metaDescription": "",
  "focusKeyword": "${name.toLowerCase()} price india",
  "keywords": ["${name} price", "${name} range", "${name} specs"]
}`;
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY not set. Get a free key from aistudio.google.com/apikey" },
      { status: 500 }
    );
  }

  const { name, vehicleType = "car" } = await request.json().catch(() => ({}));
  if (!name?.trim()) {
    return Response.json({ error: "Vehicle name is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${GEMINI_API}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: buildPrompt(name.trim(), vehicleType) }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `Gemini error ${res.status}`;
      console.error("[autofill] Gemini error:", msg);
      return Response.json({ error: msg }, { status: res.status });
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return Response.json({ error: "Empty response from Gemini" }, { status: 500 });

    // Extract JSON — properly match opening brace to avoid extra text issues
    const jsonText = extractJson(text);
    if (!jsonText) {
      console.error("[autofill] no JSON in response:", text.slice(0, 300));
      return Response.json({ error: "No JSON found in Gemini response" }, { status: 500 });
    }
    const data = JSON.parse(jsonText);
    return Response.json(data);
  } catch (err) {
    console.error("[autofill] error:", err.message);
    const message = err instanceof SyntaxError
      ? "AI returned invalid JSON — try again"
      : err.message || "AI autofill failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
