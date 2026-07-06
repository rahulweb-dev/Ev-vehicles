import Link from "next/link";
import { ChevronRight, Star, Zap, BatteryCharging, IndianRupee, CheckCircle, Award, TrendingUp } from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Best Electric Bikes & Scooters in India 2026 – Top 10 Ranked by Experts",
  description: "Expert-ranked top 10 electric bikes and scooters in India 2026. Compare Ola S1 Pro, Ather 450X, TVS iQube, Bajaj Chetak, Hero Vida by range, price & features.",
  keywords: "best electric bike india 2026, best electric scooter india, top electric scooter india 2026, ola s1 pro vs ather 450x, best ev scooter under 1 lakh, electric two wheeler india",
  alternates: { canonical: `${SITE_URL}/best-electric-bikes-india-2026` },
  openGraph: {
    title: "Best Electric Bikes & Scooters in India 2026 – Expert Ranked Top 10",
    description: "Our expert-ranked guide to the best electric scooters and bikes you can buy in India right now. Every budget covered.",
    url: `${SITE_URL}/best-electric-bikes-india-2026`,
    type: "article",
    images: [{ url: `${SITE_URL}/api/og?title=Best Electric Bikes India 2026&subtitle=Top 10 Ranked by Experts&tag=bikes&type=article`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Electric Bikes & Scooters India 2026 – Expert Top 10",
    description: "Expert-ranked top 10 electric scooters in India 2026 — range, price, features compared.",
    images: [`${SITE_URL}/api/og?title=Best Electric Bikes India 2026&subtitle=Top 10 Ranked by Experts&tag=bikes&type=article`],
  },
};

const BEST_BIKES = [
  {
    rank: 1,
    name: "Ola S1 Pro Gen 2",
    slug: "ola-s1-pro",
    badge: "Best Overall",
    badgeColor: "bg-yellow-400 text-yellow-900",
    price: "₹1.47 – ₹1.65 Lakh",
    range: "195 km",
    battery: "4 kWh",
    chargeTime: "6.5 hrs (home), 30 min (Ola Hypercharger)",
    rating: 4.7,
    pros: ["Longest range in class", "MoveOS software with OTA updates", "Ola Hypercharger network", "Reverse mode"],
    cons: ["App connectivity issues reported", "After-sales service inconsistency"],
    verdict: "The Ola S1 Pro dominates on range and features — if you live near an Ola service hub, it's the best electric scooter money can buy.",
  },
  {
    rank: 2,
    name: "Ather 450X Gen 3",
    slug: "ather-450x",
    badge: "Best Technology",
    badgeColor: "bg-blue-500 text-white",
    price: "₹1.50 – ₹1.70 Lakh",
    range: "146 km",
    battery: "3.7 kWh",
    chargeTime: "5.5 hrs (home), 1 hr (Ather Grid)",
    rating: 4.8,
    pros: ["Best-in-class build quality", "Ather Grid fast-charging network", "Premium touchscreen dashboard", "Excellent ride quality"],
    cons: ["Smaller range than Ola S1 Pro", "Premium pricing"],
    verdict: "Ather 450X is the iPhone of electric scooters — premium build, best UI, and the most reliable after-sales experience in India.",
  },
  {
    rank: 3,
    name: "TVS iQube S",
    slug: "tvs-iqube-s",
    badge: "Most Reliable",
    badgeColor: "bg-green-500 text-white",
    price: "₹1.02 – ₹1.30 Lakh",
    range: "145 km",
    battery: "3.4 kWh",
    chargeTime: "6 hrs (home)",
    rating: 4.6,
    pros: ["TVS reliability reputation", "10,000+ service centres", "Smooth ride quality", "SmartXonnect app"],
    cons: ["Smaller battery than rivals", "Basic display in base variant"],
    verdict: "For buyers who prioritise reliability and service over features, the TVS iQube S is the safest choice — backed by India's widest service network.",
  },
  {
    rank: 4,
    name: "Bajaj Chetak Premium",
    slug: "bajaj-chetak",
    badge: "Best Retro Design",
    badgeColor: "bg-purple-500 text-white",
    price: "₹1.05 – ₹1.20 Lakh",
    range: "126 km",
    battery: "3.0 kWh",
    chargeTime: "5 hrs (home)",
    rating: 4.5,
    pros: ["Metal body construction", "Premium retro styling", "Bajaj dealer network", "Smooth low-speed ride"],
    cons: ["Shorter range", "No fast charging", "Limited storage"],
    verdict: "The Chetak is for buyers who want a premium, all-metal scooter that makes a statement — built like a tank and styled like classic.",
  },
  {
    rank: 5,
    name: "Hero Vida V2 Pro",
    slug: "hero-vida-v2-pro",
    badge: "Best Value",
    badgeColor: "bg-orange-500 text-white",
    price: "₹1.09 – ₹1.25 Lakh",
    range: "143 km",
    battery: "3.94 kWh",
    chargeTime: "5.2 hrs (home)",
    rating: 4.4,
    pros: ["Hero MotoCorp service network", "Competitive price", "Removable battery option", "Connected features"],
    cons: ["Newer brand, limited track record", "App needs refinement"],
    verdict: "Hero Vida V2 Pro offers Ather-level specs at TVS-level pricing, backed by Hero's legendary service reach across India.",
  },
  {
    rank: 6,
    name: "Ather Rizta Z",
    slug: "ather-rizta-z",
    badge: "Best Family Scooter",
    badgeColor: "bg-teal-500 text-white",
    price: "₹1.09 – ₹1.30 Lakh",
    range: "160 km",
    battery: "3.7 kWh",
    chargeTime: "5.5 hrs (home)",
    rating: 4.6,
    pros: ["Large 34L under-seat storage", "Comfortable riding position", "Long range", "Ather Grid access"],
    cons: ["Heavier than 450X", "Premium pricing for a family scooter"],
    verdict: "The Rizta is the best electric scooter for families — biggest storage in class, comfortable for pillion, and Ather's reliability.",
  },
  {
    rank: 7,
    name: "Simple One",
    slug: "simple-one",
    badge: "Longest Range",
    badgeColor: "bg-red-500 text-white",
    price: "₹1.45 – ₹1.65 Lakh",
    range: "212 km",
    battery: "5 kWh",
    chargeTime: "2.5 hrs (fast charge)",
    rating: 4.3,
    pros: ["Industry-leading 212 km range", "Fast charging support", "Large storage", "Futuristic design"],
    cons: ["Smaller service network", "Brand relatively new"],
    verdict: "Simple One's 212 km range breaks records — if range anxiety is your main concern and you're near a Simple service centre, it's unbeatable.",
  },
  {
    rank: 8,
    name: "Ampere Nexus",
    slug: "ampere-nexus",
    badge: "Best Budget Premium",
    badgeColor: "bg-indigo-500 text-white",
    price: "₹1.10 – ₹1.30 Lakh",
    range: "136 km",
    battery: "3.32 kWh",
    chargeTime: "5 hrs (home)",
    rating: 4.3,
    pros: ["Greaves backing", "Ride-by-wire throttle", "Sporty design", "Multiple ride modes"],
    cons: ["Less range than top rivals", "Service network smaller than TVS/Hero"],
    verdict: "Ampere Nexus punches above its weight with sporty styling and solid specs, making it a strong choice for urban commuters.",
  },
  {
    rank: 9,
    name: "Revolt RV400",
    slug: "revolt-rv400",
    badge: "Best Electric Motorcycle",
    badgeColor: "bg-gray-700 text-white",
    price: "₹1.25 – ₹1.50 Lakh",
    range: "150 km",
    battery: "3.24 kWh",
    chargeTime: "4.5 hrs (home)",
    rating: 4.2,
    pros: ["Motorcycle styling", "Engine sound simulation", "Pan-India service", "Good range"],
    cons: ["Heavy for its segment", "Dated tech vs newer rivals"],
    verdict: "For riders who want motorcycle aesthetics and attitude in an electric package, the Revolt RV400 remains the top pick in India.",
  },
  {
    rank: 10,
    name: "Ola S1 Air",
    slug: "ola-s1-air",
    badge: "Best Entry EV",
    badgeColor: "bg-cyan-500 text-white",
    price: "₹85,000 – ₹1.00 Lakh",
    range: "101 km",
    battery: "2.5 kWh",
    chargeTime: "5 hrs (home)",
    rating: 4.1,
    pros: ["Most affordable Ola EV", "MoveOS features", "Hypercharger access", "Stylish design"],
    cons: ["Limited range", "Entry-level specs"],
    verdict: "The Ola S1 Air is the best entry point into electric scooters in India — Ola's ecosystem at a budget-friendly price.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which is the best electric scooter in India in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best electric scooters in India in 2026 are: Ola S1 Pro Gen 2 (best range at 195 km), Ather 450X Gen 3 (best build quality and technology), TVS iQube S (most reliable), Bajaj Chetak Premium (best design), and Hero Vida V2 Pro (best value). For the longest range, the Simple One offers an industry-leading 212 km.",
      },
    },
    {
      "@type": "Question",
      name: "Which electric scooter has the best range in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Simple One has the best certified range in India at 212 km on a single charge. Among popular models, Ola S1 Pro offers 195 km, Ather Rizta Z offers 160 km, TVS iQube S offers 145 km, and Ather 450X offers 146 km. Real-world range is typically 20-30% lower than these certified figures.",
      },
    },
    {
      "@type": "Question",
      name: "What is the cheapest electric scooter in India in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most affordable electric scooters in India in 2026 start from around ₹70,000–₹85,000 after state subsidies. The Ola S1 Air starts at ₹85,000, Ampere Magnus EX starts from ₹76,000, and Hero Vida V1 starts around ₹90,000. In Delhi and Maharashtra, state subsidies can reduce prices by ₹15,000–₹30,000 further.",
      },
    },
    {
      "@type": "Question",
      name: "Ola S1 Pro vs Ather 450X — which is better?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ola S1 Pro wins on range (195 km vs 146 km) and has more features at a similar price. Ather 450X wins on build quality, reliability, dealer experience, and the Ather Grid fast-charging network. For daily urban use where service matters, Ather 450X is the safer choice. For range and features on a budget, Ola S1 Pro delivers more.",
      },
    },
    {
      "@type": "Question",
      name: "Is it worth buying an electric scooter in India in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, electric scooters are absolutely worth buying for Indian urban commuters in 2026. Running cost is ₹0.10–0.15 per km versus ₹2.5–3 per km for petrol scooters — a saving of over ₹40,000 per year for 40 km/day riders. Maintenance costs are 50–60% lower (no oil changes, fewer moving parts). With government subsidies and tax benefits, the higher upfront cost is recovered in 2–3 years.",
      },
    },
  ],
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best Electric Bikes & Scooters in India 2026",
  description: "Expert-ranked top 10 electric bikes and scooters available in India in 2026",
  url: `${SITE_URL}/best-electric-bikes-india-2026`,
  numberOfItems: BEST_BIKES.length,
  itemListElement: BEST_BIKES.map((bike, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: bike.name,
    url: `${SITE_URL}/bikes/${bike.slug}`,
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",               item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Electric Bikes",     item: `${SITE_URL}/bikes` },
    { "@type": "ListItem", position: 3, name: "Best Electric Bikes 2026", item: `${SITE_URL}/best-electric-bikes-india-2026` },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Electric Bikes & Scooters in India 2026 – Top 10 Ranked",
  description: "Expert-ranked top 10 electric bikes and scooters in India 2026. Compare Ola S1 Pro, Ather 450X, TVS iQube, Bajaj Chetak by range, price and features.",
  url: `${SITE_URL}/best-electric-bikes-india-2026`,
  datePublished: "2026-01-01",
  dateModified: "2026-07-01",
  author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
  inLanguage: "en-IN",
  about: { "@type": "Thing", name: "Electric Scooters India" },
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".article-lede"] },
};

export default function BestElectricBikesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="bg-white">
        {/* Hero */}
        <div className="bg-linear-to-br from-orange-600 to-orange-800 py-14">
          <div className="mx-auto max-w-4xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-orange-200">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <Link href="/bikes" className="hover:text-white">Electric Bikes</Link>
              <ChevronRight size={14} />
              <span className="text-white font-semibold">Best Electric Bikes 2026</span>
            </nav>
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">UPDATED JULY 2026</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">EXPERT RANKED</span>
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl lg:text-6xl leading-tight">
              Best Electric Bikes<br />&amp; Scooters in India<br />
              <span className="text-orange-300">2026</span>
            </h1>
            <p className="article-lede mt-4 text-lg text-orange-100 max-w-2xl">
              Our experts tested and ranked the top 10 electric two-wheelers available in India in 2026. Compare range, price, charging speed, and after-sales service to find your perfect ride.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-orange-200">
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-orange-400" /> 10 scooters tested</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-orange-400" /> Prices as of July 2026</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-orange-400" /> Real-world range verified</span>
            </div>
          </div>
        </div>

        {/* Quick navigation */}
        <div className="border-b border-gray-100 bg-gray-50 py-3">
          <div className="mx-auto max-w-4xl px-4 flex gap-2 overflow-x-auto">
            {BEST_BIKES.map(b => (
              <a key={b.rank} href={`#rank-${b.rank}`}
                className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-700 transition">
                #{b.rank} {b.name.split(" ").slice(0, 2).join(" ")}
              </a>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12 space-y-14">
          {BEST_BIKES.map((bike) => (
            <section key={bike.rank} id={`rank-${bike.rank}`} className="scroll-mt-20">
              {/* Rank header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-lg font-black text-white">
                  {bike.rank}
                </div>
                <div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${bike.badgeColor}`}>{bike.badge}</span>
                  <h2 className="text-2xl font-black text-gray-900 mt-0.5">{bike.name}</h2>
                </div>
              </div>

              {/* Spec strip */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3 text-center">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-black text-gray-900 text-sm mt-0.5">{bike.price}</p>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-100 p-3 text-center">
                  <p className="text-xs text-gray-500">Certified Range</p>
                  <p className="font-black text-gray-900 text-sm mt-0.5">{bike.range}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 text-center">
                  <p className="text-xs text-gray-500">Battery</p>
                  <p className="font-black text-gray-900 text-sm mt-0.5">{bike.battery}</p>
                </div>
                <div className="rounded-2xl bg-purple-50 border border-purple-100 p-3 text-center">
                  <p className="text-xs text-gray-500">Charge Time</p>
                  <p className="font-black text-gray-900 text-sm mt-0.5 text-xs">{bike.chargeTime}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16}
                    className={s <= Math.round(bike.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                  />
                ))}
                <span className="text-sm font-bold text-gray-700">{bike.rating}/5</span>
              </div>

              {/* Pros / Cons */}
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Pros</p>
                  <ul className="space-y-1.5">
                    {bike.pros.map(p => (
                      <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-500" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">Cons</p>
                  <ul className="space-y-1.5">
                    {bike.cons.map(c => (
                      <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verdict */}
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">
                  <Award size={12} className="inline mr-1" />Expert Verdict
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{bike.verdict}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <Link href={`/bikes/${bike.slug}`}
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700 transition">
                  Full Specs & Review →
                </Link>
                <Link href={`/compare`}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-orange-400 transition">
                  Compare
                </Link>
              </div>
            </section>
          ))}

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently Asked Questions – Electric Bikes India 2026</h2>
            <div className="space-y-4">
              {faqJsonLd.mainEntity.map((item) => (
                <details key={item.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 open:bg-white open:shadow-sm">
                  <summary className="cursor-pointer font-bold text-gray-900 list-none flex items-center justify-between gap-3">
                    {item.name}
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related links */}
          <section className="rounded-3xl bg-gray-50 border border-gray-100 p-6">
            <h2 className="font-black text-gray-900 mb-4">Related EV Guides</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { href: "/best-electric-cars-india-2026", label: "Best Electric Cars India 2026" },
                { href: "/bikes",                          label: "Browse All Electric Bikes" },
                { href: "/ev-charging-guide",              label: "EV Charging Guide India" },
                { href: "/electric-cars-under-10-lakh",    label: "Electric Cars Under ₹10 Lakh" },
                { href: "/subsidies",                      label: "EV Subsidies India 2026" },
                { href: "/electric-vehicles",              label: "Complete EV Guide India" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-700 transition">
                  <ChevronRight size={14} className="text-gray-300" />{label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
