"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Car, Bike, Truck, BatteryCharging, Clock3, ArrowRight } from "lucide-react";
import { LatestNewsSectionSkeleton } from "@/components/skeletons/Skeletons";
import ShareLikeButtons from "@/components/news/ShareLikeButtons";

gsap.registerPlugin(ScrollTrigger);

const tabs = [
  { id: "cars",       name: "Cars",       icon: <Car size={15} /> },
  { id: "bikes",      name: "Bikes",      icon: <Bike size={15} /> },
  { id: "commercial", name: "Commercial", icon: <Truck size={15} /> },
  { id: "charging",   name: "Charging",   icon: <BatteryCharging size={15} /> },
];

const TODAY  = new Date().toISOString();
const WEEK1  = new Date(Date.now() - 1 * 86400000).toISOString();
const WEEK2  = new Date(Date.now() - 2 * 86400000).toISOString();
const WEEK3  = new Date(Date.now() - 3 * 86400000).toISOString();
const WEEK4  = new Date(Date.now() - 4 * 86400000).toISOString();

const FALLBACK = {
  cars: {
    featured: {
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop",
      title: "Tata Harrier EV Launched In India – Price, Range & Features Revealed",
      excerpt: "Tata Motors unveils the Harrier EV with 500 km range and Level 2 ADAS at ₹24.49 Lakh.",
      slug: "tata-harrier-ev-launched-india-price-range-features-2026",
      readTime: "6 min", publishedAt: TODAY,
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=400&auto=format&fit=crop", title: "Mahindra BE 6 Crosses 20,000 Bookings In 48 Hours", category: "Trending", slug: "mahindra-be6-electric-suv-review-range-performance-2026", readTime: "5 min", publishedAt: WEEK1 },
      { image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=400&auto=format&fit=crop", title: "BYD Announces 1000 km Range EV For India 2027", category: "Update", slug: "tata-harrier-ev-launched-india-price-range-features-2026", readTime: "4 min", publishedAt: WEEK2 },
      { image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop", title: "Upcoming Compact Electric SUVs Launching In 2026", category: "Upcoming", slug: "tata-harrier-ev-launched-india-price-range-features-2026", readTime: "3 min", publishedAt: WEEK3 },
      { image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop", title: "Tata Nexon EV Long Range Variant Now Available", category: "Launch", slug: "tata-harrier-ev-launched-india-price-range-features-2026", readTime: "4 min", publishedAt: WEEK4 },
    ],
  },
  bikes: {
    featured: {
      image: "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=1600&auto=format&fit=crop",
      title: "Ather 450X Gen 4 Officially Revealed With 146 km Range",
      excerpt: "Ather launches next-gen electric scooter with improved battery, Google Maps, and faster charging.",
      slug: "ather-450x-gen-4-launched-india-specs-price-2026",
      readTime: "5 min", publishedAt: TODAY,
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=400&auto=format&fit=crop", title: "Ola S1 Pro Gets Massive OTA Software Update", category: "Update", slug: "ather-450x-gen-4-launched-india-specs-price-2026", readTime: "3 min", publishedAt: WEEK1 },
      { image: "https://images.unsplash.com/photo-1517846693594-1567da72af75?q=80&w=400&auto=format&fit=crop", title: "TVS iQube ST Extended — Best Value Electric Scooter?", category: "Review", slug: "ather-450x-gen-4-launched-india-specs-price-2026", readTime: "5 min", publishedAt: WEEK2 },
      { image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=400&auto=format&fit=crop", title: "Ultraviolette F77 Mach 2: India's Fastest EV Bike", category: "Trending", slug: "ather-450x-gen-4-launched-india-specs-price-2026", readTime: "4 min", publishedAt: WEEK3 },
    ],
  },
  commercial: {
    featured: {
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1600&auto=format&fit=crop",
      title: "Volvo Introduces Next Generation Electric Trucks In India",
      excerpt: "Commercial EVs are reshaping Indian logistics with 300 km range and lower total cost of ownership.",
      slug: "india-50000-ev-charging-stations-2026-government-plan",
      readTime: "5 min", publishedAt: TODAY,
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=400&auto=format&fit=crop", title: "Ashok Leyland Expands EV Bus Production Capacity", category: "Industry", slug: "india-50000-ev-charging-stations-2026-government-plan", readTime: "4 min", publishedAt: WEEK1 },
      { image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=400&auto=format&fit=crop", title: "Electric Cargo Vans See 300% Growth In Indian Cities", category: "Trending", slug: "india-50000-ev-charging-stations-2026-government-plan", readTime: "3 min", publishedAt: WEEK2 },
    ],
  },
  charging: {
    featured: {
      image: "https://images.unsplash.com/photo-1678358181658-9e2d9b1aeb9f?q=80&w=1600&auto=format&fit=crop",
      title: "India Plans 50,000 New EV Charging Stations By 2027",
      excerpt: "Government accelerates EV charging infrastructure expansion across Tier 2 & 3 cities.",
      slug: "india-50000-ev-charging-stations-2026-government-plan",
      readTime: "4 min", publishedAt: TODAY,
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=400&auto=format&fit=crop", title: "DC Fast Charging Speed Improves By 40% With New Tech", category: "Technology", slug: "india-50000-ev-charging-stations-2026-government-plan", readTime: "4 min", publishedAt: WEEK1 },
      { image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=400&auto=format&fit=crop", title: "Battery Swapping Gains Momentum In Indian Cities", category: "Charging", slug: "india-50000-ev-charging-stations-2026-government-plan", readTime: "3 min", publishedAt: WEEK2 },
    ],
  },
};

const VIEW_ALL_HREF = {
  cars:       "/cars",
  bikes:      "/bikes",
  commercial: "/commercial",
  charging:   "/news?category=charging",
};

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function articleToFeatured(a) {
  return { image: a.image, title: a.title, excerpt: a.excerpt, slug: a.slug, readTime: a.readTime || "5 min", publishedAt: a.publishedAt };
}
function articleToSide(a) {
  return { image: a.image, title: a.title, category: a.category, slug: a.slug, readTime: a.readTime || "4 min", publishedAt: a.publishedAt };
}

export default function LatestNews({ initialArticles = null }) {
  const [active, setActive]     = useState("cars");

  const parseInitial = (articles) => {
    if (!articles || !articles.length) return { featured: null, sideNews: [] };
    return {
      featured: { image: articles[0].image, title: articles[0].title, excerpt: articles[0].excerpt, slug: articles[0].slug, readTime: articles[0].readTime || "5 min", publishedAt: articles[0].publishedAt },
      sideNews: articles.slice(1, 5).map(a => ({ image: a.image, title: a.title, category: a.category, slug: a.slug, readTime: a.readTime || "4 min", publishedAt: a.publishedAt })),
    };
  };

  const { featured: initFeat, sideNews: initSide } = parseInitial(initialArticles);
  const [loading, setLoading]   = useState(!initialArticles);
  const [featured, setFeatured] = useState(initFeat);
  const [sideNews, setSideNews] = useState(initSide);
  const cache = useRef(initialArticles ? { cars: { featured: initFeat, sideNews: initSide } } : {});

  const sectionRef  = useRef(null);
  const headingRef  = useRef(null);
  const tabsRef     = useRef(null);
  const featuredRef = useRef(null);
  const sideRef     = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0, y: 30, duration: 0.6, ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: headingRef.current, start: "top 90%", once: true },
      });
      gsap.from(tabsRef.current?.children ?? [], {
        opacity: 0, y: 16, stagger: 0.07, duration: 0.4, ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: tabsRef.current, start: "top 90%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (cache.current[active]) {
      const c = cache.current[active];
      setFeatured(c.featured);
      setSideNews(c.sideNews);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/articles?status=published&category=${active}&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        const articles = data.articles || [];
        if (articles.length === 0) throw new Error("empty");
        const feat = articleToFeatured(articles[0]);
        const side = articles.slice(1, 5).map(articleToSide);
        cache.current[active] = { featured: feat, sideNews: side };
        setFeatured(feat);
        setSideNews(side);
      })
      .catch(() => {
        const fb = FALLBACK[active] || FALLBACK.cars;
        setFeatured(fb.featured);
        setSideNews(fb.sideNews);
      })
      .finally(() => setLoading(false));
  }, [active]);

  if (loading) return <LatestNewsSectionSkeleton />;

  const feat     = featured || FALLBACK[active]?.featured;
  const side     = sideNews.length ? sideNews : FALLBACK[active]?.sideNews || [];
  const featHref = `/news/${feat?.slug}`;

  return (
    <section ref={sectionRef} className="py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">

        {/* Heading */}
        <div ref={headingRef} className="mb-5 flex items-start justify-between gap-4 md:mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 md:text-5xl">
              Latest <span className="text-green-600">EV News</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500 md:mt-3 md:text-base">
              Breaking electric vehicle updates &amp; future mobility trends.
            </p>
          </div>
          <Link
            href={VIEW_ALL_HREF[active] || "/news"}
            className="mt-1 flex shrink-0 items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tabs — horizontal scroll on mobile, wrap on desktop */}
        <div
          ref={tabsRef}
          className="mb-5 flex gap-2 overflow-x-auto pb-1 md:mb-7 md:flex-wrap md:gap-3"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-300 md:rounded-2xl md:px-5 md:py-2.5 md:text-sm ${
                active === tab.id
                  ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                  : "border-gray-300 bg-gray-100 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Main grid: stacked on mobile → two columns on lg */}
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:gap-5 xl:grid-cols-[1fr_360px]">

          {/* Featured card */}
          <div
            ref={featuredRef}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm md:rounded-3xl"
          >
            <div className="relative h-65 sm:h-90 lg:h-125">
              {feat?.image && (
                <Image
                  src={feat.image}
                  alt={feat.title || "Featured EV News"}
                  fill
                  priority
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />

              {/* Badge */}
              <div className="absolute left-3 top-3 rounded-full border border-green-400/30 bg-green-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-400 backdrop-blur-xl md:left-5 md:top-5 md:text-xs">
                FEATURED
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-0 w-full p-4 sm:p-5 md:p-7">
                <h3 className="line-clamp-2 text-base font-black leading-snug text-white sm:text-xl md:text-2xl lg:text-3xl">
                  {feat?.title}
                </h3>
                {feat?.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-gray-300 sm:mt-2 sm:text-sm md:text-base">
                    {feat.excerpt}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-[11px] text-white/70 sm:text-xs">
                  <span className="flex items-center gap-1">
                    <Clock3 size={11} />
                    {feat?.readTime || "5 min"} read
                  </span>
                  {feat?.publishedAt && (
                    <>
                      <span>·</span>
                      <span>{fmtDate(feat.publishedAt)}</span>
                    </>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:mt-4">
                  <Link
                    href={featHref}
                    className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-green-400 to-blue-500 px-4 py-2 text-xs font-semibold text-black transition hover:scale-105 sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    Read Full Story <ArrowRight size={13} />
                  </Link>
                  {feat?.slug && (
                    <ShareLikeButtons slug={feat.slug} title={feat.title} compact />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side news — 2-col grid on mobile/tablet, scrollable list on desktop */}
          <div
            ref={sideRef}
            className="grid  gap-2.5 sm:gap-3 lg:flex lg:h-125 lg:flex-col lg:gap-2.5 lg:overflow-y-auto lg:pr-1 custom-scrollbar"
          >
            {side.map((item, index) => (
              <Link
                key={index}
                href={`/news/${item.slug}`}
                className="group flex gap-2.5 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm transition hover:border-green-400 hover:shadow-md sm:gap-3 sm:p-3"
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-18 sm:w-18 lg:h-20 lg:w-20">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                    sizes="80px"
                  />
                </div>

                {/* Text */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <span className="mb-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700">
                      {item.category}
                    </span>
                    <h4 className="line-clamp-2 text-[11px] font-bold leading-snug text-gray-800 transition group-hover:text-green-600 sm:text-xs lg:text-[13px]">
                      {item.title}
                    </h4>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock3 size={9} />
                      {item.readTime} read
                    </span>
                    {item.publishedAt && (
                      <>
                        <span>·</span>
                        <span className="font-medium text-gray-600">{fmtDate(item.publishedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
