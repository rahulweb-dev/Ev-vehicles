import { ImageResponse } from "next/og";

export const runtime = "edge";

// Serves all missing PWA icon sizes dynamically.
// e.g. /images/icons/icon-144x144.png  →  144×144 green ⚡ icon
export async function GET(request, { params }) {
  const { filename } = await params;

  // Parse "icon-144x144.png" → 144
  const match = filename.match(/icon-(\d+)x(\d+)/);
  const size  = match ? parseInt(match[1], 10) : 192;

  const fontSize    = Math.round(size * 0.48);
  const borderRadius = Math.round(size * 0.22);

  const img = new ImageResponse(
    (
      <div
        style={{
          width:           size,
          height:          size,
          background:      "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          borderRadius,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
        }}
      >
        <span style={{ fontSize, lineHeight: 1 }}>⚡</span>
      </div>
    ),
    { width: size, height: size }
  );

  // Icons are static — cache at CDN edge for 1 year to eliminate redundant generation
  return new Response(img.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
