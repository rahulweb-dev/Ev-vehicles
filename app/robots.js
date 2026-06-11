export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: [
      "https://www.evradar.in/sitemap.xml",
      "https://www.evradar.in/news-sitemap.xml",
    ],
    host:    "https://www.evradar.in",
  };
}
