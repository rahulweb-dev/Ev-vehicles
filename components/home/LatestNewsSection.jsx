"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Car, Bike, Truck, BatteryCharging, Clock3, ArrowRight, Bookmark } from "lucide-react";
import { LatestNewsSectionSkeleton } from "@/components/skeletons/Skeletons";

gsap.registerPlugin(ScrollTrigger);

const tabs = [
  { id: "cars",       name: "Cars",       icon: <Car size={18} /> },
  { id: "bikes",      name: "Bikes",      icon: <Bike size={18} /> },
  { id: "commercial", name: "Commercial", icon: <Truck size={18} /> },
  { id: "charging",   name: "Charging",   icon: <BatteryCharging size={18} /> },
];

/* ─── Static fallback data ──────────────────────────────────── */
const FALLBACK = {
  cars: {
    featured: {
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop",
      title: "Tata Harrier EV Launched In India – Price, Range & Features Revealed",
      excerpt: "Tata Motors unveils the Harrier EV with 500 km range and Level 2 ADAS at ₹24.49 Lakh.",
      slug: "tata-harrier-ev-launched-india-price-range-features-2026",
      readTime: "6 min",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=400&auto=format&fit=crop", title: "Tesla Model 3 Long Range Now Available In India", category: "Launch", slug: "cars" },
      { image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=400&auto=format&fit=crop", title: "Mahindra BE 6 Crosses 20,000 Bookings In 48 Hours", category: "Trending", slug: "mahindra-be6-electric-suv-review-range-performance-2026" },
      { image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop", title: "BYD Announces 1000 km Range EV For India 2027", category: "Update", slug: "cars" },
      { image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop", title: "Upcoming Compact Electric SUVs Launching In 2026", category: "Upcoming", slug: "cars" },
    ],
  },
  bikes: {
    featured: {
      image: "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=1600&auto=format&fit=crop",
      title: "Ather 450X Gen 4 Officially Revealed With 146 km Range",
      excerpt: "Ather launches next-gen electric scooter with improved battery, Google Maps, and faster charging.",
      slug: "ather-450x-gen-4-launched-india-specs-price-2026",
      readTime: "5 min",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=400&auto=format&fit=crop", title: "Ola S1 Pro Gets Massive OTA Software Update", category: "Update", slug: "bikes" },
      { image: "https://images.unsplash.com/photo-1517846693594-1567da72af75?q=80&w=400&auto=format&fit=crop", title: "TVS iQube ST Extended — Best Value Electric Scooter?", category: "Review", slug: "bikes" },
      { image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=400&auto=format&fit=crop", title: "Ultraviolette F77 Mach 2: India's Fastest EV Bike", category: "Trending", slug: "bikes/ultraviolette-f77" },
    ],
  },
  commercial: {
    featured: {
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1600&auto=format&fit=crop",
      title: "Volvo Introduces Next Generation Electric Trucks In India",
      excerpt: "Commercial EVs are reshaping Indian logistics with 300 km range and lower TCO.",
      slug: "commercial",
      readTime: "5 min",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=400&auto=format&fit=crop", title: "Ashok Leyland Expands EV Bus Production Capacity", category: "Industry", slug: "commercial" },
      { image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=400&auto=format&fit=crop", title: "Electric Cargo Vans See 300% Growth In Indian Cities", category: "Trending", slug: "commercial" },
    ],
  },
  charging: {
    featured: {
      image: "https://images.unsplash.com/photo-1678358181658-9e2d9b1aeb9f?q=80&w=1600&auto=format&fit=crop",
      title: "India Plans 50,000 New EV Charging Stations By 2027",
      excerpt: "Government accelerates EV charging infrastructure expansion across Tier 2 & 3 cities.",
      slug: "india-50000-ev-charging-stations-2026-government-plan",
      readTime: "4 min",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=400&auto=format&fit=crop", title: "DC Fast Charging Speed Improves By 40% With New Tech", category: "Technology", slug: "electric-vehicles" },
      { image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=400&auto=format&fit=crop", title: "Battery Swapping Gains Momentum In Indian Cities", category: "Charging", slug: "electric-vehicles" },
    ],
  },
};

function articleToFeatured(a) {
  return { image: a.image, title: a.title, excerpt: a.excerpt, slug: a.slug, readTime: a.readTime || "5 min" };
}
function articleToSide(a) {
  return { image: a.image, title: a.title, category: a.category, slug: a.slug };
}

export default function LatestNews() {
  const [active, setActive]     = useState("cars");
  const [loading, setLoading]   = useState(true);
  const [featured, setFeatured] = useState(null);
  const [sideNews, setSideNews] = useState([]);
  const cache = useRef({});

  const sectionRef  = useRef(null);
  const headingRef  = useRef(null);
  const tabsRef     = useRef(null);
  const featuredRef = useRef(null);
  const sideRef     = useRef(null);

  /* ── ScrollTrigger animations ─────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0, y: 40, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 88%" },
      });
      gsap.from(tabsRef.current?.children ?? [], {
        opacity: 0, y: 20, stagger: 0.08, duration: 0.45, ease: "power2.out",
        scrollTrigger: { trigger: tabsRef.current, start: "top 88%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── Fetch articles for active tab ────────────────────────── */
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

  /* ── Render skeleton while loading ────────────────────────── */
  if (loading) return <LatestNewsSectionSkeleton />;

  const feat = featured || FALLBACK[active]?.featured;
  const side = sideNews.length ? sideNews : FALLBACK[active]?.sideNews || [];
  const featHref = feat?.slug?.startsWith("/") ? feat.slug : feat?.slug?.includes("/") ? `/${feat.slug}` : `/news/${feat?.slug}`;

  return (
    <section ref={sectionRef} className="py-16">
      <div className="mx-auto max-w-7xl px-4">

        {/* Heading */}
        <div ref={headingRef} className="mb-10">
          <h2 className="text-4xl font-black md:text-5xl">
            Latest <span className="text-green-400">EV News</span>
          </h2>
          <p className="mt-3 text-lg text-gray-400">
            Breaking electric vehicle updates &amp; future mobility trends.
          </p>
        </div>

        {/* Tabs */}
        <div ref={tabsRef} className="mb-10 flex flex-wrap gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                active === tab.id
                  ? "border-green-400 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-green-400/30 hover:bg-white/10"
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">

          {/* Featured */}
          <div ref={featuredRef} className="group relative overflow-hidden rounded-4xl border border-white/10 bg-white/5">
            <div className="relative h-75 md:h-137.5">
              {feat?.image && (
                <Image src={feat.image} alt={feat.title || "Featured"} fill
                  className="object-cover transition duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
              <div className="absolute left-6 top-6 rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400 backdrop-blur-xl">
                FEATURED
              </div>
              <div className="absolute bottom-0 p-6 md:p-10">
                <h3 className="max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
                  {feat?.title}
                </h3>
                {feat?.excerpt && (
                  <p className="mt-5 max-w-2xl text-gray-300 md:text-lg">{feat.excerpt}</p>
                )}
                <div className="mt-6 flex items-center gap-5 text-sm text-gray-400">
                  <span className="flex items-center gap-2"><Clock3 size={15} />{feat?.readTime || "5 min"} read</span>
                </div>
                <Link href={featHref}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-green-400 to-blue-500 px-7 py-4 font-semibold text-black transition hover:scale-105">
                  Read Full Story <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          {/* Side news */}
          <div ref={sideRef} className="h-137.5 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            {side.map((item, index) => {
              const href = item.slug?.startsWith("/") ? item.slug
                : item.slug?.includes("/") ? `/${item.slug}` : `/news/${item.slug}`;
              return (
                <Link key={index} href={href}
                  className="group flex gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 transition hover:border-green-400/30 hover:bg-white/10">
                  <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={item.image} alt={item.title} fill
                      className="object-cover transition duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="mb-3 inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold capitalize text-green-400">
                        {item.category}
                      </div>
                      <h4 className="text-base font-bold leading-snug transition group-hover:text-green-400">
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-2"><Clock3 size={14} />4 min read</span>
                      <Bookmark size={18} className="cursor-pointer transition hover:text-green-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
