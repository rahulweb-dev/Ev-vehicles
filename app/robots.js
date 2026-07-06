export default function robots() {
  return {
    rules: [
      // All crawlers: allow public content, block internal/private paths
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/saved",
          "/offline",
          "/compare?",   // query-param compare URLs — clean /compare/[slug] is indexed instead
        ],
      },

      // ── Citation & retrieval bots (ALLOW) ──────────────────────────
      // These bots retrieve your content to cite it in AI-generated answers.
      // Blocking them prevents your site from being referenced in Perplexity,
      // ChatGPT Browse, Claude web search, and Bing Copilot responses.
      { userAgent: "PerplexityBot",  allow: "/" },
      { userAgent: "ChatGPT-User",   allow: "/" },   // ChatGPT web browsing
      { userAgent: "anthropic-ai",   allow: "/" },   // Claude web search
      { userAgent: "YouBot",         allow: "/" },   // You.com AI search
      { userAgent: "DuckAssistBot",  allow: "/" },   // DuckDuckGo AI answers

      // ── Training-only scrapers (BLOCK) ─────────────────────────────
      // These bots harvest content for model training without citation.
      { userAgent: "GPTBot",         disallow: "/" }, // OpenAI training
      { userAgent: "CCBot",          disallow: "/" }, // Common Crawl training
      { userAgent: "ClaudeBot",      disallow: "/" }, // Anthropic training
      { userAgent: "Bytespider",     disallow: "/" }, // ByteDance/TikTok training
      { userAgent: "Diffbot",        disallow: "/" }, // Diffbot training
      { userAgent: "Omgilibot",      disallow: "/" }, // Social media scraper
      { userAgent: "FacebookBot",    disallow: "/" }, // Meta scraper
    ],
    sitemap: [
      "https://www.evradar.in/sitemap.xml",
      "https://www.evradar.in/news-sitemap.xml",
    ],
    host: "https://www.evradar.in",
  };
}
