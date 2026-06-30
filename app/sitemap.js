const SITE_URL = "https://www.evradar.in";

const STATIC_PAGES = [
  { url: SITE_URL,                                    priority: 1.0,  freq: "daily"   },
  { url: `${SITE_URL}/news`,                          priority: 0.95, freq: "hourly"  },
  { url: `${SITE_URL}/cars`,                          priority: 0.9,  freq: "daily"   },
  { url: `${SITE_URL}/bikes`,                         priority: 0.9,  freq: "daily"   },
  { url: `${SITE_URL}/compare`,                       priority: 0.85, freq: "weekly"  },
  { url: `${SITE_URL}/faq`,                           priority: 0.7,  freq: "monthly" },
  { url: `${SITE_URL}/commercial`,                    priority: 0.75, freq: "daily"   },
  { url: `${SITE_URL}/electric-vehicles`,             priority: 0.75, freq: "daily"   },
  { url: `${SITE_URL}/blogs`,                         priority: 0.8,  freq: "weekly"  },
  { url: `${SITE_URL}/brands`,                         priority: 0.7,  freq: "weekly"  },
  { url: `${SITE_URL}/authors`,                       priority: 0.6,  freq: "weekly"  },
  { url: `${SITE_URL}/about`,                         priority: 0.5,  freq: "monthly" },
  { url: `${SITE_URL}/contact`,                       priority: 0.5,  freq: "monthly" },
  { url: `${SITE_URL}/privacy-policy`,                priority: 0.3,  freq: "yearly"  },
  { url: `${SITE_URL}/terms-and-conditions`,          priority: 0.3,  freq: "yearly"  },
  /* High-traffic guide pages */
  { url: `${SITE_URL}/best-electric-cars-india-2026`, priority: 0.92, freq: "weekly"  },
  { url: `${SITE_URL}/upcoming-electric-cars-india`,  priority: 0.9,  freq: "weekly"  },
  { url: `${SITE_URL}/electric-cars-under-10-lakh`,   priority: 0.9,  freq: "weekly"  },
  { url: `${SITE_URL}/ev-charging-guide`,             priority: 0.85, freq: "monthly" },
  { url: `${SITE_URL}/government-ev-policy-india`,    priority: 0.8,  freq: "monthly" },
  /* Interactive tools */
  { url: `${SITE_URL}/range-calculator`,              priority: 0.8,  freq: "monthly" },
  { url: `${SITE_URL}/resale-calculator`,             priority: 0.78, freq: "monthly" },
  { url: `${SITE_URL}/subsidy-calculator`,            priority: 0.8,  freq: "monthly" },
  { url: `${SITE_URL}/ev-quiz`,                       priority: 0.75, freq: "monthly" },
  { url: `${SITE_URL}/ev-savings-calculator`,         priority: 0.75, freq: "monthly" },
  { url: `${SITE_URL}/charging-stations`,             priority: 0.78, freq: "weekly"  },
  { url: `${SITE_URL}/subsidies`,                     priority: 0.78, freq: "weekly"  },
];

/*
 * Only top 5 cities for price pages — 12 cities × all cars = hundreds of thin pages
 * that waste crawl budget. Keep only the highest-traffic metro cities.
 */
const TOP_CITIES = ["mumbai", "delhi", "bangalore", "hyderabad", "pune"];

async function getDbEntries() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();

    const Blog = (await import("@/lib/models/Blog")).default;

    const [articles, vehicles, blogs] = await Promise.all([
      Article.find({ status: "published" })
        .select("slug publishedAt updatedAt author tags")
        .lean(),
      Vehicle.find({ status: "published" })
        .select("slug vehicleType brand updatedAt featured")
        .lean(),
      Blog.find({ status: "published" })
        .select("slug publishedAt updatedAt featured")
        .lean(),
    ]);

    /* ── Article pages ────────────────────────────────────────────── */
    const articleUrls = articles.map(a => ({
      url:             `${SITE_URL}/news/${a.slug}`,
      lastModified:    a.publishedAt || a.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    }));

    /* ── Vehicle detail pages ─────────────────────────────────────── */
    const vehicleUrls = vehicles.map(v => ({
      url:             `${SITE_URL}/${v.vehicleType === "car" ? "cars" : v.vehicleType === "bike" ? "bikes" : "commercial"}/${v.slug}`,
      lastModified:    v.updatedAt || new Date(),
      changeFrequency: "monthly",
      priority:        v.featured ? 0.85 : 0.75,
    }));

    /* ── Author archive pages ─────────────────────────────────────── */
    const uniqueAuthors = [...new Set(articles.map(a => a.author).filter(Boolean))];
    const authorUrls = uniqueAuthors.map(author => ({
      url:             `${SITE_URL}/authors/${encodeURIComponent(author.toLowerCase().replace(/\s+/g, "-"))}`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.6,
    }));

    /* ── Tag pages — only tags with 3+ articles (quality threshold) ─ */
    const tagCounts = {};
    articles.forEach(a => (a.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const qualityTags = Object.entries(tagCounts)
      .filter(([, count]) => count >= 3)
      .map(([tag]) => tag);
    const tagUrls = qualityTags.map(tag => ({
      url:             `${SITE_URL}/news/tags/${encodeURIComponent(tag)}`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.55,
    }));

    /* ── Brand pages ──────────────────────────────────────────────── */
    const uniqueBrands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))];
    const brandUrls = uniqueBrands.map(brand => ({
      url:             `${SITE_URL}/brands/${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, "-"))}`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.7,
    }));

    /*
     * ── Compare pages — REMOVED from sitemap ──────────────────────
     * Pairwise combinations grow as O(n²): 50 vehicles = 1,225 URLs,
     * 100 vehicles = 4,950 URLs. Google treats these as thin/duplicate
     * content and skips them, burning crawl budget.
     * Compare pages are discovered organically via internal links.
     *
     * If you want specific high-value comparisons indexed, add them
     * manually to STATIC_PAGES above (e.g. nexon-ev-vs-punch-ev).
     */

    /* ── City price pages — top 5 cities only ────────────────────── */
    const carSlugs = vehicles.filter(v => v.vehicleType === "car").map(v => v.slug);
    const cityPriceUrls = carSlugs.flatMap(slug =>
      TOP_CITIES.map(city => ({
        url:             `${SITE_URL}/cars/${slug}/price-in-${city}`,
        lastModified:    new Date(),
        changeFrequency: "monthly",
        priority:        0.7,
      }))
    );

    /* ── Blog pages ──────────────────────────────────────────────── */
    const blogUrls = blogs.map(b => ({
      url:             `${SITE_URL}/blogs/${b.slug}`,
      lastModified:    b.publishedAt || b.updatedAt || new Date(),
      changeFrequency: "monthly",
      priority:        b.featured ? 0.82 : 0.72,
    }));

    return [...articleUrls, ...vehicleUrls, ...authorUrls, ...tagUrls, ...brandUrls, ...cityPriceUrls, ...blogUrls];
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
