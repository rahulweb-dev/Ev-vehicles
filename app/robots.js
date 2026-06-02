export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: "https://www.evradar.in//sitemap.xml",
    host: "https://www.evradar.in/",
  };
}
