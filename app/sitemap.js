const SITE_URL = "https://www.evradar.in";

const STATIC_PAGES = [
  { url: SITE_URL,                                    priority: 1.0,  freq: "daily"   },
  { url: `${SITE_URL}/news`,                          priority: 0.95, freq: "hourly"  },
  { url: `${SITE_URL}/cars`,                          priority: 0.9,  freq: "daily"   },
  { url: `${SITE_URL}/bikes`,                         priority: 0.9,  freq: "daily"   },
  { url: `${SITE_URL}/compare`,                       priority: 0.85, freq: "weekly"  },
  { url: `${SITE_URL}/faq`,                           priority: 0.7,  freq: "monthly", since: "2024-06-01" },
  { url: `${SITE_URL}/commercial`,                    priority: 0.75, freq: "daily"   },
  { url: `${SITE_URL}/electric-vehicles`,             priority: 0.95, freq: "daily"   },
  /* News category archive pages — each has its own canonical now */
  { url: `${SITE_URL}/news?category=cars`,            priority: 0.82, freq: "daily"   },
  { url: `${SITE_URL}/news?category=bikes`,           priority: 0.82, freq: "daily"   },
  { url: `${SITE_URL}/news?category=commercial`,      priority: 0.75, freq: "daily"   },
  { url: `${SITE_URL}/news?category=charging`,        priority: 0.75, freq: "daily"   },
  /* Popular compare pages — high-intent "X vs Y" queries */
  { url: `${SITE_URL}/compare/tata-nexon-ev-vs-tata-punch-ev`,         priority: 0.78, freq: "monthly" },
  { url: `${SITE_URL}/compare/hyundai-creta-electric-vs-tata-nexon-ev`,priority: 0.78, freq: "monthly" },
  { url: `${SITE_URL}/compare/mahindra-be-6-vs-tata-nexon-ev`,         priority: 0.78, freq: "monthly" },
  { url: `${SITE_URL}/compare/ola-s1-pro-vs-ather-450x`,               priority: 0.78, freq: "monthly" },
  { url: `${SITE_URL}/compare/tata-punch-ev-vs-mg-windsor-ev`,         priority: 0.75, freq: "monthly" },
  { url: `${SITE_URL}/compare/tvs-iqube-vs-bajaj-chetak`,              priority: 0.75, freq: "monthly" },
  { url: `${SITE_URL}/blogs`,                         priority: 0.8,  freq: "weekly"  },
  { url: `${SITE_URL}/brands`,                        priority: 0.7,  freq: "weekly"  },
  { url: `${SITE_URL}/authors`,                       priority: 0.6,  freq: "weekly"  },
  { url: `${SITE_URL}/about`,                         priority: 0.5,  freq: "monthly", since: "2025-01-01" },
  { url: `${SITE_URL}/contact`,                       priority: 0.5,  freq: "monthly", since: "2025-01-01" },
  { url: `${SITE_URL}/privacy-policy`,                priority: 0.3,  freq: "yearly",  since: "2024-01-01" },
  { url: `${SITE_URL}/terms-and-conditions`,          priority: 0.3,  freq: "yearly",  since: "2024-01-01" },
  /* High-traffic guide pages */
  { url: `${SITE_URL}/best-electric-cars-india-2026`,  priority: 0.92, freq: "weekly"  },
  { url: `${SITE_URL}/best-electric-bikes-india-2026`, priority: 0.92, freq: "weekly"  },
  { url: `${SITE_URL}/upcoming-electric-cars-india`,   priority: 0.9,  freq: "weekly"  },
  { url: `${SITE_URL}/electric-cars-under-10-lakh`,    priority: 0.9,  freq: "weekly"  },
  { url: `${SITE_URL}/ev-charging-guide`,             priority: 0.85, freq: "monthly", since: "2025-03-01" },
  { url: `${SITE_URL}/government-ev-policy-india`,    priority: 0.8,  freq: "monthly", since: "2025-03-01" },
  { url: `${SITE_URL}/ev-glossary`,                   priority: 0.82, freq: "monthly", since: "2025-04-01" },
  /* Interactive tools */
  { url: `${SITE_URL}/range-calculator`,              priority: 0.8,  freq: "monthly", since: "2025-01-01" },
  { url: `${SITE_URL}/resale-calculator`,             priority: 0.78, freq: "monthly", since: "2025-01-01" },
  { url: `${SITE_URL}/subsidy-calculator`,            priority: 0.8,  freq: "monthly", since: "2025-01-01" },
  { url: `${SITE_URL}/ev-quiz`,                       priority: 0.75, freq: "monthly", since: "2025-01-01" },
  { url: `${SITE_URL}/ev-savings-calculator`,         priority: 0.75, freq: "monthly", since: "2025-01-01" },
  { url: `${SITE_URL}/charging-stations`,             priority: 0.78, freq: "weekly"  },
  { url: `${SITE_URL}/subsidies`,                     priority: 0.78, freq: "weekly"  },
];

/*
 * Top 12 metro cities for price pages — major Indian markets with highest EV adoption.
 * Balanced crawl budget vs. coverage: 12 cities × N cars = N×12 URLs.
 */
// MUST match the CITIES array in app/cars/[slug]/price-in-[city]/page.js exactly
const TOP_CITIES = [
  "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
  "pune", "ahmedabad", "kolkata", "jaipur", "lucknow",
  "chandigarh", "bhopal",
];

async function getDbEntries() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();

    const Blog = (await import("@/lib/models/Blog")).default;

    const NEWS_CATS = ["cars", "bikes", "commercial", "charging"];
    const NEWS_LIMIT = 20;

    const [articles, vehicles, blogs, totalNewsCount, ...catCounts] = await Promise.all([
      Article.find({ status: "published" })
        .select("slug publishedAt updatedAt author tags image")
        .lean(),
      Vehicle.find({ status: "published" })
        .select("slug vehicleType brand updatedAt featured featuredImage name")
        .lean(),
      Blog.find({ status: "published" })
        .select("slug publishedAt updatedAt featured")
        .lean(),
      Article.countDocuments({ status: "published" }),
      ...NEWS_CATS.map(cat => Article.countDocuments({ status: "published", category: cat })),
    ]);

    /* ── Article pages ────────────────────────────────────────────── */
    const articleUrls = articles.map(a => ({
      url:             `${SITE_URL}/news/${a.slug}`,
      lastModified:    a.publishedAt || a.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
      ...(a.image && { images: [a.image] }),
    }));

    /* ── Vehicle detail pages ─────────────────────────────────────── */
    const vehicleUrls = vehicles.map(v => ({
      url:             `${SITE_URL}/${v.vehicleType === "car" ? "cars" : v.vehicleType === "bike" ? "bikes" : "commercial"}/${v.slug}`,
      lastModified:    v.updatedAt || new Date(),
      changeFrequency: "monthly",
      priority:        v.featured ? 0.85 : 0.75,
      ...(v.featuredImage && { images: [v.featuredImage] }),
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

    /* ── City price pages — inherit vehicle's updatedAt ──────────── */
    const cityPriceUrls = vehicles
      .filter(v => v.vehicleType === "car")
      .flatMap(v =>
        TOP_CITIES.map(city => ({
          url:             `${SITE_URL}/cars/${v.slug}/price-in-${city}`,
          lastModified:    v.updatedAt || new Date(),
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

    /* ── Paginated /news pages — pages 2-N (up to 10) ───────────────── */
    const totalNewsPages = Math.ceil(totalNewsCount / NEWS_LIMIT);
    const newsPaginatedUrls = Array.from(
      { length: Math.min(totalNewsPages - 1, 9) },
      (_, i) => ({
        url:             `${SITE_URL}/news?page=${i + 2}`,
        lastModified:    new Date(),
        changeFrequency: "daily",
        priority:        0.7,
      })
    );

    /* ── Paginated category pages — pages 2-N per category ──────────── */
    const catPaginatedUrls = NEWS_CATS.flatMap((cat, idx) => {
      const count = catCounts[idx] || 0;
      const pages = Math.ceil(count / NEWS_LIMIT);
      return Array.from({ length: Math.min(pages - 1, 4) }, (_, i) => ({
        url:             `${SITE_URL}/news?category=${cat}&page=${i + 2}`,
        lastModified:    new Date(),
        changeFrequency: "daily",
        priority:        0.65,
      }));
    });

    return [
      ...articleUrls, ...vehicleUrls, ...authorUrls, ...tagUrls,
      ...brandUrls, ...cityPriceUrls, ...blogUrls,
      ...newsPaginatedUrls, ...catPaginatedUrls,
    ];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const dbEntries = await getDbEntries();

  const staticEntries = STATIC_PAGES.map(p => ({
    url:             p.url,
    lastModified:    p.since ? new Date(p.since) : new Date(),
    changeFrequency: p.freq,
    priority:        p.priority,
  }));

  return [...staticEntries, ...dbEntries];
}
