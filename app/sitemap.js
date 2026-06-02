import { newsArticles } from "@/data/newsArticles";
import { blogsData } from "@/data/blogsData";

const SITE_URL = "https://www.evradar.in/";

export default function sitemap() {
  const newsUrls = newsArticles.map((article) => ({
    url: `${SITE_URL}/news/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogUrls = blogsData.map((blog) => ({
    url: `${SITE_URL}/blogs/${blog.slug}`,
    lastModified: new Date(blog.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/cars`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/bikes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/commercial`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/electric-vehicles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...newsUrls,
    ...blogUrls,
  ];
}
