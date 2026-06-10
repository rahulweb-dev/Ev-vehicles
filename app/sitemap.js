const SITE_URL = "https://www.evradar.in";

const STATIC_PAGES = [
  { url: SITE_URL,                        priority: 1.0, freq: "daily"   },
  { url: `${SITE_URL}/news`,              priority: 0.95, freq: "hourly" },
  { url: `${SITE_URL}/cars`,              priority: 0.9,  freq: "daily"  },
  { url: `${SITE_URL}/bikes`,             priority: 0.9,  freq: "daily"  },
  { url: `${SITE_URL}/compare`,           priority: 0.85, freq: "weekly" },
  { url: `${SITE_URL}/faq`,              priority: 0.7,  freq: "monthly"},
  { url: `${SITE_URL}/commercial`,        priority: 0.75, freq: "daily"  },
  { url: `${SITE_URL}/electric-vehicles`, priority: 0.75, freq: "daily"  },
  { url: `${SITE_URL}/blogs`,             priority: 0.8,  freq: "weekly" },
  { url: `${SITE_URL}/about`,             priority: 0.5,  freq: "monthly"},
  { url: `${SITE_URL}/contact`,           priority: 0.5,  freq: "monthly"},
  { url: `${SITE_URL}/privacy-policy`,    priority: 0.3,  freq: "yearly" },
  { url: `${SITE_URL}/terms`,             priority: 0.3,  freq: "yearly" },
];

async function getDbEntries() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();

    const [articles, vehicles] = await Promise.all([
      Article.find({ status: "published" }).select("slug publishedAt updatedAt author tags").lean(),
      Vehicle.find({ status: "published" }).select("slug vehicleType brand updatedAt").lean(),
    ]);

    const articleUrls = articles.map(a => ({
      url:             `${SITE_URL}/news/${a.slug}`,
      lastModified:    a.publishedAt || a.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    }));

    const vehicleUrls = vehicles.map(v => ({
      url:             `${SITE_URL}/${v.vehicleType === "car" ? "cars" : "bikes"}/${v.slug}`,
      lastModified:    v.updatedAt || new Date(),
      changeFrequency: "monthly",
      priority:        0.75,
    }));

    /* author archive pages */
    const uniqueAuthors = [...new Set(articles.map(a => a.author).filter(Boolean))];
    const authorUrls = uniqueAuthors.map(author => ({
      url:             `${SITE_URL}/authors/${encodeURIComponent(author.toLowerCase().replace(/\s+/g, "-"))}`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.6,
    }));

    /* tag archive pages */
    const uniqueTags = [...new Set(articles.flatMap(a => a.tags || []).filter(Boolean))];
    const tagUrls = uniqueTags.map(tag => ({
      url:             `${SITE_URL}/news/tags/${encodeURIComponent(tag)}`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.55,
    }));

    /* brand pages */
    const uniqueBrands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))];
    const brandUrls = uniqueBrands.map(brand => ({
      url:             `${SITE_URL}/brands/${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, "-"))}`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.7,
    }));

    /* generate all pairwise comparison URLs */
    const comparePairs = [];
    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) {
        comparePairs.push({
          url:             `${SITE_URL}/compare/${vehicles[i].slug}-vs-${vehicles[j].slug}`,
          lastModified:    new Date(),
          changeFrequency: "monthly",
          priority:        0.65,
        });
      }
    }

    return [...articleUrls, ...vehicleUrls, ...authorUrls, ...tagUrls, ...brandUrls, ...comparePairs];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const dbEntries = await getDbEntries();

  const staticEntries = STATIC_PAGES.map(p => ({
    url:             p.url,
    lastModified:    new Date(),
    changeFrequency: p.freq,
    priority:        p.priority,
  }));

  return [...staticEntries, ...dbEntries];
}
