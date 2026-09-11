import { ImageResponse } from "next/og";

export const runtime = "edge";

// Satori (powering ImageResponse) only supports TTF/OTF — WOFF2 throws
// "Unsupported OpenType signature wOF2". Google Fonts returns TTF when
// the User-Agent is an old browser that doesn't support WOFF2.
async function getFont() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap",
      {
        headers: { "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)" },
        signal: controller.signal,
      }
    );
    const css = await cssRes.text();
    const ttfUrl = css.match(/src:\s*url\((.+?)\)\s*format\(['"]truetype['"]\)/)?.[1];
    if (!ttfUrl) return null;
    const fontRes = await fetch(ttfUrl, { signal: controller.signal });
    clearTimeout(timer);
    const buf = await fontRes.arrayBuffer();
    // Validate it's actually TTF (not WOFF2) before passing to Satori
    const sig = String.fromCharCode(...new Uint8Array(buf.slice(0, 4)));
    if (sig === "wOF2" || sig === "wOFF") return null;
    return buf;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const title    = searchParams.get("title")    || "EV Radar";
  const subtitle = searchParams.get("subtitle") || "India's #1 Electric Vehicle News Platform";
  const image    = searchParams.get("image")    || "";
  const tag      = searchParams.get("tag")      || "";
  const type     = searchParams.get("type")     || "article";

  const tagColors = {
    cars:       { bg: "#dbeafe", text: "#1e40af" },
    bikes:      { bg: "#ffedd5", text: "#c2410c" },
    commercial: { bg: "#f3e8ff", text: "#7e22ce" },
    charging:   { bg: "#d1fae5", text: "#065f46" },
    news:       { bg: "#fef9c3", text: "#854d0e" },
    reviews:    { bg: "#fce7f3", text: "#9d174d" },
    default:    { bg: "#dcfce7", text: "#166534" },
  };
  const tagStyle = tagColors[tag?.toLowerCase()] || tagColors.default;

  try {
    const interFont = await getFont();

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background image with overlay */}
          {image && (
            <img
              src={image}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.18,
              }}
            />
          )}

          {/* Green glow */}
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              right: "-80px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(22,163,74,0.4) 0%, transparent 70%)",
            }}
          />

          {/* Left content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "56px 60px",
              flex: 1,
              position: "relative",
            }}
          >
            {/* Top: logo + tag */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  background: "#16a34a",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "20px", color: "#ffffff", fontWeight: 900 }}>⚡ EVRadar</span>
              </div>
              {tag && (
                <div
                  style={{
                    background: tagStyle.bg,
                    color: tagStyle.text,
                    borderRadius: "999px",
                    padding: "6px 16px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {tag}
                </div>
              )}
            </div>

            {/* Middle: title */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  fontSize: title.length > 60 ? "38px" : title.length > 40 ? "44px" : "52px",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  maxWidth: "750px",
                }}
              >
                {title}
              </div>
              {subtitle && (
                <div
                  style={{
                    fontSize: "20px",
                    color: "#94a3b8",
                    fontWeight: 500,
                    maxWidth: "700px",
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>

            {/* Bottom: site URL */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ color: "#4ade80", fontSize: "18px", fontWeight: 600 }}>evradar.in</span>
              <span style={{ color: "#64748b", fontSize: "16px", marginLeft: "8px" }}>India&apos;s #1 EV News Platform</span>
            </div>
          </div>

          {/* Right: vehicle image box (if image provided) */}
          {image && type === "vehicle" && (
            <div
              style={{
                width: "420px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 40px 40px 0",
                flexShrink: 0,
              }}
            >
              <img
                src={image}
                style={{
                  width: "100%",
                  height: "280px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
                }}
              />
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        ...(interFont && {
          fonts: [{ name: "Inter", data: interFont, weight: 700, style: "normal" }],
        }),
      }
    );

    // Buffer the full body so any streaming error is caught inside this try/catch
    // (streaming errors after headers are sent can't be caught otherwise)
    const body = await new Response(imageResponse.body).arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", "image/png");
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800");
    return new Response(body, { status: 200, headers });
  } catch {
    return Response.redirect(new URL("/images/og-default.jpg", request.url), 302);
  }
}
