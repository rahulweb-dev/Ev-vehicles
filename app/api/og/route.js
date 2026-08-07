import { ImageResponse } from "next/og";

export const runtime = "edge";

async function getFont() {
  const res = await fetch("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2");
  return res.arrayBuffer();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const interFont = await getFont().catch(() => null);

  const title    = searchParams.get("title")    || "EV Radar";
  const subtitle = searchParams.get("subtitle") || "India's #1 Electric Vehicle News Platform";
  const image    = searchParams.get("image")    || "";
  const tag      = searchParams.get("tag")      || "";
  const type     = searchParams.get("type")     || "article"; // article | vehicle | page

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
        fonts: [{ name: "Inter", data: interFont, weight: 900, style: "normal" }],
      }),
    }
  );

  // OG images are deterministic for a given URL — cache aggressively at the CDN edge.
  // Without this, every bot/unfurl regenerates the image via Satori on every request.
  return new Response(imageResponse.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
