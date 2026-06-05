import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const metadata = {
  title: "Electric Vehicle FAQ India 2026 – EV Questions Answered | EV News India",
  description:
    "Answers to the most common electric vehicle questions in India — EV range, charging time, cost, government subsidies, best EVs under ₹15 lakh, and battery life.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "Electric Vehicle FAQ India 2026 | EV News India",
    description:
      "Answers to the most common questions about electric vehicles in India — range, charging, cost, subsidies, and best EVs.",
    url: `${SITE_URL}/faq`,
    type: "website",
  },
};

const faqCategories = [
  {
    category: "General EV Questions",
    items: [
      {
        q: "What is the range of electric cars in India in 2026?",
        a: "Most electric cars in India offer a real-world range of 250–500 km on a single charge in 2026. Premium models like Tata Harrier EV offer ~500 km, mid-range models like Tata Nexon EV offer ~325 km, and entry-level EVs like Tata Tiago EV offer ~250 km. Real-world range depends on driving speed, AC usage, traffic, and road conditions.",
      },
      {
        q: "Is it worth buying an electric car in India in 2026?",
        a: "Yes, buying an electric car in India in 2026 is worth it for most buyers. Electricity costs just ₹1–2 per km versus ₹7–9 per km for petrol, saving ₹60,000–₹80,000 annually. Lower maintenance costs (no oil changes, fewer brake services) and government tax benefits (5% GST vs 28–50% for petrol cars) make EVs financially attractive — especially if you drive 30+ km per day.",
      },
      {
        q: "What maintenance does an electric vehicle need?",
        a: "Electric vehicles need significantly less maintenance than petrol cars. There are no oil changes, spark plug replacements, or timing belt services. Regular maintenance includes tyre rotation every 10,000 km, annual brake fluid check, cabin air filter replacement, battery health check, and software updates. Annual EV maintenance typically costs ₹5,000–₹10,000 versus ₹15,000–₹30,000 for petrol cars.",
      },
      {
        q: "Can electric cars run in heavy rain or extreme heat in India?",
        a: "Yes, modern electric cars are designed for Indian weather conditions including monsoon rains and extreme heat. They have IP67/IP68 rated battery packs that are fully waterproof. Very high temperatures (above 45°C) may temporarily reduce battery range by 10–15%, but this is not permanent damage. All major brands like Tata, MG, and Hyundai test their EVs extensively for Indian climate conditions.",
      },
      {
        q: "How much does it cost to run an EV per km in India?",
        a: "Running an EV in India costs approximately ₹1–1.5 per km on home electricity, and ₹2–3 per km on public DC fast chargers. For comparison, a petrol car costs ₹7–9 per km at current fuel prices. This makes EVs 4–6 times cheaper to run, which means significant savings for daily commuters who drive 30–50 km per day.",
      },
    ],
  },
  {
    category: "EV Charging Questions",
    items: [
      {
        q: "How long does it take to charge an electric car in India?",
        a: "Charging time depends on the charger type: A standard 3.3 kW AC home charger takes 8–12 hours for a full charge. A 7.2 kW AC fast charger takes 4–6 hours. A 50 kW DC fast charger gives 80% charge in 45–60 minutes. A 100+ kW ultra-fast DC charger (Tata Power, ATHER Grid) takes just 20–30 minutes for 80% charge. For daily use, overnight home charging is the most convenient and cheapest option.",
      },
      {
        q: "How much does it cost to charge an EV at home in India?",
        a: "Charging an EV at home in India costs approximately ₹1–2 per km. For a 40 kWh battery (Tata Nexon EV), a full charge costs ₹320–₹480 at typical home electricity rates of ₹8–₹12 per unit, giving ~325 km range. Monthly home charging costs ₹1,500–₹2,500 for average urban commuters driving 40–50 km/day — far cheaper than monthly petrol expenses of ₹8,000–₹15,000.",
      },
      {
        q: "What is the difference between AC and DC fast charging for EVs?",
        a: "AC (Alternating Current) charging uses the car's built-in onboard charger and is slower, ranging from 3.3 kW to 22 kW. It is ideal for home charging and overnight workplace charging. DC (Direct Current) fast charging bypasses the onboard charger and directly charges the battery at 50 kW to 150 kW+, reducing charge time to just 20–60 minutes. DC fast chargers are available at public stations like Tata Power EV, ATHER Grid, Ola Hypercharger, and ChargeZone.",
      },
      {
        q: "How many EV charging stations are there in India?",
        a: "As of 2026, India has over 25,000+ public EV charging stations across the country. Major charging networks include Tata Power EV (8,000+ stations), ChargeZone (2,500+ stations), Statiq (3,000+ stations), ATHER Grid (1,500+ stations), and government FAME-funded stations. Charging infrastructure is concentrated in metro cities but rapidly expanding to Tier 2 and Tier 3 cities under the National EV scheme.",
      },
      {
        q: "Can I charge my EV at any charging station in India?",
        a: "Most public charging stations in India support CCS2 (Combined Charging System) and CHAdeMO DC connectors, plus Type 2 AC connectors — covering almost all EVs sold in India. You can use apps like Tata Power EV, ChargeZone, Statiq, or Google Maps to find compatible nearby stations. Some premium networks require a membership or app-based payment, but most support UPI, credit cards, and prepaid wallets.",
      },
      {
        q: "Can I install an EV home charger in an apartment in India?",
        a: "Yes, you can install an EV home charger in an apartment in India, but it requires approval from your housing society and compliance with local electrical codes. Many EV manufacturers like Tata, Hyundai, and MG include a home charger installation service with the vehicle purchase. The installation typically costs ₹5,000–₹15,000. Urban societies increasingly support EV chargers in basements and parking areas.",
      },
    ],
  },
  {
    category: "Government Policy & Subsidies",
    items: [
      {
        q: "What is the GST rate on electric vehicles in India?",
        a: "Electric vehicles attract only 5% GST in India, compared to 28–50% for petrol and diesel vehicles. This significantly reduces the upfront cost of EVs. The reduced GST applies to all battery-operated vehicles including cars, two-wheelers, and three-wheelers. EV chargers also attract a lower GST rate of 5%, making home and public charging infrastructure more affordable.",
      },
      {
        q: "What government subsidies are available on electric vehicles in India?",
        a: "India offers several EV subsidies: (1) PM E-DRIVE scheme provides up to ₹10,000 per kWh subsidy for electric two-wheelers and ₹50,000 for electric three-wheelers. (2) State-level subsidies — Delhi offers up to ₹1.5 lakh, Maharashtra up to ₹1 lakh, Gujarat up to ₹20,000. (3) Section 80EEB of Income Tax Act allows ₹1.5 lakh deduction on interest paid for EV loans. (4) Road tax exemption in many states.",
      },
      {
        q: "What is the FAME scheme for electric vehicles in India?",
        a: "FAME (Faster Adoption and Manufacturing of Electric Vehicles) is India's central government scheme to accelerate EV adoption. FAME II (2019–2024) provided demand subsidies for electric two-wheelers, three-wheelers, and buses, with ₹10,000 crore budget. It helped reduce EV prices by ₹10,000–₹50,000 for buyers. The successor PM E-DRIVE scheme now extends these benefits with a ₹10,900 crore allocation for 2024–2026.",
      },
      {
        q: "Do I get tax benefits on an EV loan in India?",
        a: "Yes. Under Section 80EEB of the Income Tax Act, you can claim up to ₹1.5 lakh deduction per year on the interest paid for an electric vehicle loan. This benefit is available for both cars and two-wheelers purchased for personal use. The loan must be taken from a financial institution (bank or NBFC) and the EV must be purchased between April 1, 2019, and March 31, 2023 (extended in later budgets).",
      },
    ],
  },
  {
    category: "Best Electric Vehicles in India",
    items: [
      {
        q: "Which is the best electric car under ₹15 lakh in India?",
        a: "The best electric cars under ₹15 lakh in India in 2026: (1) Tata Tiago EV (₹7.99–₹11.89 lakh) — best entry-level EV, 250 km range; (2) Tata Punch EV (₹9.99–₹14.99 lakh) — best compact SUV, up to 421 km range; (3) MG Comet EV (₹6.99–₹9.99 lakh) — best city car; (4) Tata Nexon EV at ₹14.49 lakh (base) offers the best overall package with 325 km range and 5-star safety rating.",
      },
      {
        q: "Which electric scooter has the longest range in India?",
        a: "The electric scooters with the longest certified range in India in 2026: (1) TVS iQube ST — 212 km; (2) Ola S1 Pro Gen 2 — 195 km; (3) Ather 450X Gen 4 — 146 km; (4) Bajaj Chetak Premium — 108 km. For electric motorcycles, the Ultraviolette F77 Mach 2 leads with 307 km range, followed by the Revolt RV400 at 150 km and Ola Roadster at 579 km (claimed).",
      },
      {
        q: "Which is the cheapest electric car in India in 2026?",
        a: "The most affordable electric cars in India in 2026: (1) MG Comet EV starts at ₹6.99 lakh — a compact city EV with 230 km range; (2) Tata Tiago EV starts at ₹7.99 lakh — better range and more practical for daily use; (3) Citroen ë-C3 starts at ₹11.5 lakh. For city commuters, the MG Comet EV offers the lowest entry price, while the Tata Tiago EV provides better value with superior range and features.",
      },
      {
        q: "What is the best electric SUV in India?",
        a: "The best electric SUVs in India in 2026: (1) Mahindra BE 6 (₹18.90 lakh) — best performance EV with 682 km range; (2) Tata Harrier EV (₹24.99 lakh) — best premium EV with 500 km range and Level 2 ADAS; (3) Tata Nexon EV (₹14.49 lakh) — best value with 325 km range; (4) MG ZS EV (₹18.98 lakh) — best connected features. The Mahindra BE 6 and Tata Harrier EV lead the premium segment.",
      },
    ],
  },
  {
    category: "EV Battery Questions",
    items: [
      {
        q: "What is the lifespan of an EV battery in India?",
        a: "Modern EV batteries are designed to last 8–10 years or 1.5–2 lakh km, whichever comes first. Most manufacturers (Tata, MG, Hyundai) offer battery warranties of 8 years or 1.6 lakh km. Capacity degrades by 15–20% over this period. After warranty period, batteries can often be repurposed for stationary energy storage, extending their overall useful life to 15–20 years.",
      },
      {
        q: "Does extreme heat damage EV batteries in India?",
        a: "Short-term extreme heat (above 45°C) temporarily reduces EV range by 10–20% but does not cause permanent damage to modern battery packs. Most Indian EVs include a Battery Thermal Management System (BTMS) using liquid or air cooling to maintain safe operating temperatures. Long-term repeated exposure to extreme heat can slightly accelerate degradation over years, but parking in shade and using scheduled charging (overnight) minimizes this impact.",
      },
      {
        q: "What happens when an EV battery needs replacement?",
        a: "If an EV battery fails within the warranty period (typically 8 years / 1.6 lakh km), it is replaced free of charge by the manufacturer. After warranty, battery replacement costs ₹3–8 lakh depending on the vehicle model and battery capacity. However, third-party refurbished batteries are available at 30–50% lower cost. The EV industry is also developing battery-as-a-service models and second-life applications to reduce replacement costs.",
      },
    ],
  },
];

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="bg-white">
        {/* Hero */}
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">FAQ</span>
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              Electric Vehicle <span className="text-green-400">FAQ</span>
            </h1>
            <p className="mt-3 text-gray-400 text-lg">
              Answers to India&apos;s most common questions about electric vehicles in 2026.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Quick links */}
          <div className="mb-10 flex flex-wrap gap-2">
            {faqCategories.map((cat) => (
              <a
                key={cat.category}
                href={`#${cat.category.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                {cat.category}
              </a>
            ))}
          </div>

          {/* FAQ sections */}
          {faqCategories.map((cat) => (
            <section
              key={cat.category}
              id={cat.category.toLowerCase().replace(/\s+/g, "-")}
              className="mb-12 scroll-mt-20"
            >
              <h2 className="mb-5 text-xl font-black text-gray-900 border-l-4 border-green-500 pl-4">
                {cat.category}
              </h2>
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                {cat.items.map((item, i) => (
                  <details key={i} className="group bg-white">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-5 font-semibold text-gray-900 hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                      <span className="text-sm leading-snug sm:text-base">{item.q}</span>
                      <span className="mt-0.5 shrink-0 text-green-500 text-xl font-light leading-none">
                        <svg className="h-5 w-5 transition-transform duration-200 group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          {/* CTA */}
          <div className="mt-10 rounded-2xl bg-green-600 p-8 text-center text-white">
            <h3 className="text-xl font-black">Still have questions?</h3>
            <p className="mt-2 text-green-100">
              Browse our latest EV news and in-depth guides for more answers.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/news"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-50"
              >
                Latest EV News
              </Link>
              <Link
                href="/blogs"
                className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                EV Guides & Blogs
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
