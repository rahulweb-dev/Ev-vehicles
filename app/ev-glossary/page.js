import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "EV Glossary – Electric Vehicle Terms Explained | EV News India",
  description: "Complete glossary of electric vehicle terms for India. Understand ARAI range, BMS, regenerative braking, CCS2, CHAdeMO, WLTP, SOC, IP67, and every EV acronym explained simply.",
  keywords: "ev glossary india, electric vehicle terms, what is arai range, what is bms ev, ev abbreviations explained, ccs2 charger india, ev terminology",
  alternates: { canonical: `${SITE_URL}/ev-glossary` },
  openGraph: {
    title: "EV Glossary – Every Electric Vehicle Term Explained",
    description: "Plain-English definitions of every EV acronym and term used in India — ARAI range, BMS, regenerative braking, CCS2, SOC, and more.",
    url: `${SITE_URL}/ev-glossary`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Glossary India&subtitle=Every EV term explained simply&tag=guide&type=page`, width: 1200, height: 630 }],
  },
};

const TERMS = [
  {
    term: "ARAI Range",
    id: "arai-range",
    definition: "ARAI (Automotive Research Association of India) range is the official certified driving range of an EV measured under standardised Indian test conditions. It represents how far the EV can travel on a full charge under controlled laboratory conditions. Real-world range is typically 15–25% lower than ARAI range due to traffic, AC usage, and driving speed.",
    category: "Range & Battery",
  },
  {
    term: "WLTP Range",
    id: "wltp-range",
    definition: "WLTP (Worldwide Harmonised Light Vehicle Test Procedure) is a globally standardised range and emissions test developed in Europe. It is considered more accurate than older NEDC tests and is used by international EV brands like Hyundai, Kia, BYD, and Volvo in India. WLTP range is typically 10–20% lower than ARAI-certified range for the same vehicle.",
    category: "Range & Battery",
  },
  {
    term: "BMS (Battery Management System)",
    id: "bms",
    definition: "The BMS is the electronic brain of an EV battery pack. It continuously monitors cell voltage, temperature, state of charge (SOC), and state of health (SOH) across all battery cells. A good BMS prevents overcharging, deep discharge, and overheating — the three main causes of battery degradation. It also manages cell balancing to ensure uniform discharge across all cells.",
    category: "Battery Technology",
  },
  {
    term: "SOC (State of Charge)",
    id: "soc",
    definition: "SOC is the current charge level of an EV battery expressed as a percentage (0–100%). It is equivalent to a fuel gauge in a petrol car. EV manufacturers recommend keeping SOC between 20–80% for daily use to maximise battery longevity. Charging to 100% or discharging below 10% regularly can accelerate battery degradation.",
    category: "Battery Technology",
  },
  {
    term: "SOH (State of Health)",
    id: "soh",
    definition: "SOH measures the current maximum capacity of an EV battery compared to its original rated capacity, expressed as a percentage. A battery with 90% SOH has 10% permanent capacity loss. Most EV warranties guarantee minimum 70% SOH over the warranty period (typically 8 years / 1,60,000 km).",
    category: "Battery Technology",
  },
  {
    term: "Regenerative Braking",
    id: "regenerative-braking",
    definition: "Regenerative braking (regen) is a system where the electric motor acts as a generator during deceleration, converting kinetic energy back into electricity to recharge the battery. This extends real-world range by 10–25% in stop-and-go city traffic. Most EVs offer adjustable regen levels; some support one-pedal driving where regen alone can bring the vehicle to a complete stop.",
    category: "Driving Technology",
  },
  {
    term: "One-Pedal Driving",
    id: "one-pedal-driving",
    definition: "One-pedal driving is an EV feature where strong regenerative braking decelerates the car significantly when the accelerator is released, often bringing it to a complete stop without pressing the brake pedal. It maximises energy recovery and reduces brake wear. Available in Tata Nexon EV, MG ZS EV, BYD Atto 3, and other EVs in India.",
    category: "Driving Technology",
  },
  {
    term: "CCS2 (Combined Charging System 2)",
    id: "ccs2",
    definition: "CCS2 is the standard DC fast charging connector used in India for most electric cars. It combines a Type 2 AC connector with two additional DC pins, supporting both AC and DC charging through a single port. CCS2 supports up to 350 kW DC fast charging. Most Tata, Mahindra, Hyundai, Kia, BYD, and MG EVs in India use the CCS2 standard.",
    category: "Charging",
  },
  {
    term: "CHAdeMO",
    id: "chademo",
    definition: "CHAdeMO is a DC fast charging standard developed in Japan. In India, it is used primarily by older Nissan Leaf models. It is being phased out globally in favour of CCS2. The name means 'How about a cup of tea?' in Japanese — a reference to the time needed to charge (30–60 minutes).",
    category: "Charging",
  },
  {
    term: "Type 2 (AC Charging)",
    id: "type-2-ac",
    definition: "Type 2 is the standard AC charging connector for electric cars in India and Europe. It supports single-phase (3.3–7.4 kW) and three-phase (11–22 kW) AC charging. Most home wallbox chargers and public AC chargers in India use the Type 2 connector. Full charge time ranges from 4–12 hours depending on the charger and battery size.",
    category: "Charging",
  },
  {
    term: "DC Fast Charging",
    id: "dc-fast-charging",
    definition: "DC fast charging bypasses the EV's onboard AC/DC converter and delivers high-power DC electricity directly to the battery. In India, public DC fast chargers range from 25 kW to 150 kW. A 50 kW charger typically charges most EVs from 10–80% in 45–60 minutes. Ultra-fast 100+ kW chargers can achieve 10–80% in 20–30 minutes on compatible vehicles.",
    category: "Charging",
  },
  {
    term: "V2L (Vehicle-to-Load)",
    id: "v2l",
    definition: "V2L is a feature that allows an EV to power external electrical devices using the car's battery as a mobile power source. It works through a standard 230V AC socket in the car's charge port or interior. V2L EVs in India include the Hyundai Ioniq 5, Kia EV6, and BYD Atto 3. A typical 60 kWh battery can power household devices for 12–24 hours.",
    category: "Technology Features",
  },
  {
    term: "V2G (Vehicle-to-Grid)",
    id: "v2g",
    definition: "V2G allows an EV to send electricity back to the power grid, effectively turning the car into a mobile energy storage unit. The EV can charge when grid electricity is cheap (off-peak) and discharge when demand peaks. V2G is still emerging in India; the government has proposed V2G integration in future EV policies to stabilise the grid.",
    category: "Technology Features",
  },
  {
    term: "IP Rating (IP67 / IP68)",
    id: "ip-rating",
    definition: "IP (Ingress Protection) rating indicates a device's resistance to dust and water. In EVs, the battery pack and charging system have IP ratings. IP67 means protected against dust and submersion in 1 metre of water for 30 minutes. IP68 means protected against deeper or longer submersion. Higher IP ratings indicate better protection for the battery in India's monsoon conditions.",
    category: "Safety & Standards",
  },
  {
    term: "FAME Scheme (FAME India)",
    id: "fame-scheme",
    definition: "FAME (Faster Adoption and Manufacturing of Electric Vehicles) is the Indian government's flagship EV subsidy scheme. FAME 2 (2019–2024) offered subsidies of ₹10,000 per kWh for electric cars and ₹15,000 per kWh for electric two-wheelers. The successor scheme PM E-Drive (2024–2026) continues demand-side incentives for EVs with an outlay of ₹10,900 crore.",
    category: "Policy & Incentives",
  },
  {
    term: "PM E-Drive",
    id: "pm-e-drive",
    definition: "PM E-Drive (Prime Minister's Electric Drive Revolution in Innovative Vehicle Enhancement) is India's current EV promotion scheme launched in 2024, replacing FAME 2. It provides demand subsidies for electric two-wheelers (₹5,000 per kWh), electric buses, and EV charging infrastructure. Budget: ₹10,900 crore over two years (2024–2026).",
    category: "Policy & Incentives",
  },
  {
    term: "OTA Updates",
    id: "ota-updates",
    definition: "OTA (Over-the-Air) updates allow EV manufacturers to remotely update vehicle software, fix bugs, improve range, add features, and update safety systems — just like a smartphone update. Tesla pioneered OTA updates for EVs. In India, Tata, MG, Hyundai, and Kia offer OTA updates. A major OTA update can improve range by 5–15% or add new driving modes.",
    category: "Technology Features",
  },
  {
    term: "ADAS (Advanced Driver Assistance Systems)",
    id: "adas",
    definition: "ADAS is a collection of safety technologies that assist the driver. Common ADAS features in Indian EVs include: Lane Departure Warning (LDW), Automatic Emergency Braking (AEB), Adaptive Cruise Control (ACC), Blind Spot Detection (BSD), and Front Collision Warning (FCW). Level 2 ADAS (simultaneous steering + acceleration/braking assistance) is available in the Hyundai Ioniq 5, Kia EV6, and premium BYD models in India.",
    category: "Safety & Standards",
  },
  {
    term: "Range Anxiety",
    id: "range-anxiety",
    definition: "Range anxiety is the fear that an EV will run out of charge before reaching a destination or charging station. It is the most cited barrier to EV adoption in India. Modern EVs with 400–600 km range, coupled with India's expanding charging network (8,000+ public chargers as of 2024), have significantly reduced range anxiety for city commuters. Highway anxiety remains for routes without adequate DC fast chargers.",
    category: "Concepts",
  },
  {
    term: "kWh (Kilowatt-hour)",
    id: "kwh",
    definition: "kWh is the unit of energy used to measure EV battery capacity. A larger kWh battery holds more energy and typically offers greater range. For example, the Tata Nexon EV has a 40.5 kWh battery offering ~465 km ARAI range, while the BYD Atto 3 has a 60.48 kWh battery for 521 km ARAI range. Home charging at ₹8/unit (kWh) means a 40 kWh full charge costs ₹320.",
    category: "Range & Battery",
  },
];

const CATEGORIES = [...new Set(TERMS.map(t => t.category))];

export default function EVGlossaryPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "EV Glossary", item: `${SITE_URL}/ev-glossary` },
    ],
  };

  const definedTermsJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}/ev-glossary#termset`,
    name: "Electric Vehicle Glossary – India",
    description: "Complete glossary of electric vehicle terms, abbreviations, and concepts for Indian EV buyers and enthusiasts.",
    url: `${SITE_URL}/ev-glossary`,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organization` },
    hasDefinedTerm: TERMS.map(t => ({
      "@type": "DefinedTerm",
      "@id": `${SITE_URL}/ev-glossary#${t.id}`,
      name: t.term,
      description: t.definition,
      inDefinedTermSet: `${SITE_URL}/ev-glossary#termset`,
      termCode: t.id,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TERMS.map(t => ({
      "@type": "Question",
      name: `What is ${t.term}?`,
      acceptedAnswer: { "@type": "Answer", text: t.definition },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "EV Glossary – Complete Electric Vehicle Terms & Abbreviations for India",
    description: "Plain-English guide to every electric vehicle acronym and term used in India.",
    url: `${SITE_URL}/ev-glossary`,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organization` },
    author: { "@id": `${SITE_URL}/#organization` },
    about: { "@type": "Thing", name: "Electric Vehicles" },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".glossary-lede"] },
    dateModified: new Date().toISOString().split("T")[0],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">EV Glossary</span>
            </nav>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-900 px-3 py-1 text-xs font-bold text-green-300">
              <BookOpen size={11} /> Complete Reference
            </div>
            <h1 className="text-3xl font-black text-white md:text-5xl">
              EV Glossary<br /><span className="text-green-400">Every Term Explained</span>
            </h1>
            <p className="glossary-lede mt-3 max-w-2xl text-lg text-gray-400">
              Plain-English definitions of every electric vehicle acronym, technical term, and concept — from ARAI range to V2G, BMS to ADAS.
            </p>

            {/* Quick jump */}
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <a key={cat} href={`#cat-${cat.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}`}
                  className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-300 hover:bg-green-700 hover:text-white transition">
                  {cat}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10 space-y-14">
          {CATEGORIES.map(category => (
            <section key={category} id={`cat-${category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}`}>
              <h2 className="mb-6 border-b border-gray-200 pb-3 text-xl font-black text-gray-900">
                {category}
              </h2>
              <div className="space-y-6">
                {TERMS.filter(t => t.category === category).map(term => (
                  <div key={term.id} id={term.id} className="scroll-mt-20 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900">{term.term}</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">{term.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* CTA */}
          <div className="rounded-2xl bg-gray-900 p-8 text-center">
            <p className="text-xl font-black text-white">Ready to explore EVs?</p>
            <p className="mt-2 text-gray-400">Use your new EV vocabulary to compare specs and prices</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/cars" className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
                Browse Electric Cars →
              </Link>
              <Link href="/ev-charging-guide" className="rounded-full border border-gray-600 px-6 py-2.5 text-sm font-bold text-gray-300 hover:border-white hover:text-white transition">
                EV Charging Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
