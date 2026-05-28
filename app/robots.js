export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: "https://evnewsindia.com/sitemap.xml",
    host: "https://evnewsindia.com",
  };
}
