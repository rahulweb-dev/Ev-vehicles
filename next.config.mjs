/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  reactCompiler: true,
  experimental: {
    // Tree-shake barrel-export packages so only imported icons/components land in the bundle
    optimizePackageImports: ["lucide-react", "swiper", "@next/third-parties"],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      // Redirect non-www to www (permanent 301)
      {
        source: "/:path*",
        has: [{ type: "host", value: "evradar.in" }],
        destination: "https://www.evradar.in/:path*",
        permanent: true,
      },
      // Vehicle pages removed, merged or renamed (Nov 2026 catalogue clean-up).
      // `:path*` also covers sub-pages such as /price-in-<city>.
      ...[
        ["/cars/urban-cruiser", "/cars/toyota-urban-cruiser-ev"],          // duplicate of the Urban Cruiser Ebella
        ["/cars/hyundai-creta-electric-n-line", "/cars/hyundai-creta-electric"], // model does not exist
        ["/cars/honda-elevate-ev", "/cars/honda-alpha"],                   // Elevate EV cancelled; Honda's first India EV is the Alpha
        ["/bikes/ather-el01", "/bikes/ather-konarc"],                      // EL01 was the codename of the Konarc
        ["/bikes/suzuki-burgman-electric", "/bikes/suzuki-e-access"],      // e-Burgman never launched; Suzuki sells the e-Access
        ["/commercial/tata-ultra-t-7-electric", "/commercial/tata-ultra-e-7"], // Ultra T.7 Electric replaced by Ultra E.7
      ].flatMap(([from, to]) => [
        { source: from, destination: to, permanent: true },
        { source: `${from}/:path+`, destination: `${to}/:path+`, permanent: true },
      ]),
      // iQube vs Chetak comparison now targets the Chetak 35 Series page
      { source: "/compare/tvs-iqube-electric-vs-bajaj-chetak-electric", destination: "/compare/tvs-iqube-electric-vs-bajaj-chetak-35-series", permanent: true },
      { source: "/compare/bajaj-chetak-electric-vs-tvs-iqube-electric", destination: "/compare/tvs-iqube-electric-vs-bajaj-chetak-35-series", permanent: true },
      // Pages for models that never existed — send to the listing
      ...["/bikes/bounce-infinity-e1-pro", "/bikes/tvs-creon"].map((from) => ({ source: `${from}/:path*`, destination: "/bikes", permanent: true })),
    ];
  },

  async rewrites() {
    return [
      // Serve Google News sitemap at the conventional .xml URL
      { source: "/sitemap-news.xml", destination: "/sitemap-news" },
    ];
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      // Scripts: Next.js hydration needs unsafe-inline; AdSense/GA/SWG need these domains
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagmanager.com https://www.google-analytics.com https://news.google.com https://www.google.com https://www.gstatic.com https://apis.google.com https://adservice.google.com https://tpc.googlesyndication.com https://*.adtrafficquality.google",
      // Styles: inline styles + Google Fonts + Subscribe with Google stylesheets
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://news.google.com",
      // Fonts
      "font-src 'self' data: https://fonts.gstatic.com",
      // Images: allow all HTTPS (vehicle/news images come from many CDNs)
      "img-src 'self' data: blob: https: http:",
      // Fetch/XHR: GA, our own API, AdSense reporting, Subscribe with Google,
      // live chat (Pusher), error reporting (Sentry), charging map, read-aloud translation, location lookup
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.google.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://firestore.googleapis.com https://news.google.com https://*.pusher.com wss://*.pusher.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://api.openchargemap.io https://translate.googleapis.com https://nominatim.openstreetmap.org",
      // Frames: YouTube embeds + AdSense iframes
      "frame-src https://www.youtube.com https://player.vimeo.com https://www.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google https://news.google.com",
      // Media: audio player uses blob URLs
      "media-src 'self' blob: https:",
      // Service worker
      "worker-src 'self' blob:",
      // Web app manifest
      "manifest-src 'self'",
      // Clickjacking — replaces X-Frame-Options
      "frame-ancestors 'self'",
      // Block Flash and other plugins
      "object-src 'none'",
      // Prevent base-tag injection
      "base-uri 'self'",
    ].join("; ");

    return [
      {
        // Long-lived cache for immutable Next.js static assets (hashed filenames)
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache public images and icons for 30 days
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy",   value: csp },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(self), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
