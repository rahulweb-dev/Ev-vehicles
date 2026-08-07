import Link from 'next/link'
import { ChevronRight, MapPin, IndianRupee, CheckCircle, ExternalLink } from 'lucide-react'
import { SITE_URL, SITE_NAME } from '@/app/layout'

export const revalidate = 86400

export const metadata = {
  title: 'State-wise EV Subsidy in India 2026 – Electric Vehicle Incentives | EV Radar',
  description: 'Complete guide to state-wise EV subsidies in India 2026. Delhi, Maharashtra, Gujarat, Karnataka, Rajasthan, Tamil Nadu EV incentives, road tax waivers and registration fee exemptions explained.',
  keywords: 'ev subsidy india 2026, state ev incentives india, delhi ev subsidy, maharashtra ev policy, gujarat ev subsidy, karnataka ev incentive, rajasthan ev scheme, electric vehicle subsidy india',
  alternates: { canonical: `${SITE_URL}/ev-subsidy` },
  openGraph: {
    title: 'State-wise EV Subsidy in India 2026 – Complete Guide',
    description: 'Find out how much subsidy you can get on an EV in your state. Delhi, Maharashtra, Gujarat, Karnataka and more.',
    url: `${SITE_URL}/ev-subsidy`,
    type: 'website',
    images: [{ url: `${SITE_URL}/api/og?title=EV Subsidies India 2026&subtitle=State-wise incentives guide&tag=guide&type=page`, width: 1200, height: 630 }],
  },
}

const STATES = [
  {
    state: 'Delhi',
    flag: '🏛️',
    policy: 'Delhi EV Policy 2020 (extended 2025)',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹5,000 per kWh (max ₹30,000)' },
      { label: 'Three-Wheeler Subsidy', value: 'Up to ₹30,000' },
      { label: 'Four-Wheeler Subsidy', value: 'Up to ₹1,50,000 (first 1,000 buyers)' },
      { label: 'Road Tax Waiver', value: '100% waived' },
      { label: 'Registration Fee', value: '100% waived' },
      { label: 'Congestion Relief', value: 'Odd-Even exempt' },
    ],
    notes: 'Delhi\'s EV Policy is one of the most comprehensive in India. The state aims for 25% EV share by 2025. Buyers must register in Delhi to avail subsidies.',
    color: 'border-red-200 bg-red-50',
    badge: 'bg-red-100 text-red-700',
  },
  {
    state: 'Maharashtra',
    flag: '🌇',
    policy: 'Maharashtra EV Policy 2021',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹10,000' },
      { label: 'Three-Wheeler Subsidy', value: 'Up to ₹30,000' },
      { label: 'Four-Wheeler (private)', value: 'Up to ₹1,50,000 (first 1 lakh buyers)' },
      { label: 'Road Tax Waiver', value: '100% for first 2 years, 50% years 3–5' },
      { label: 'Registration Fee', value: '100% waived' },
      { label: 'Stamp Duty', value: 'Waived on EV loans' },
    ],
    notes: 'Maharashtra targets 10% EV share by 2025. Mumbai, Pune, Nagpur and Nashik have priority charging infrastructure. Commercial EV operators get additional incentives.',
    color: 'border-orange-200 bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    state: 'Gujarat',
    flag: '🏭',
    policy: 'Gujarat EV Policy 2021–2026',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹20,000 (early bird) / ₹10,000 (standard)' },
      { label: 'Three-Wheeler Subsidy', value: 'Up to ₹50,000' },
      { label: 'Four-Wheeler Subsidy', value: 'Up to ₹1,50,000 (battery-based)' },
      { label: 'Road Tax Waiver', value: '50% for 5 years' },
      { label: 'Registration Fee', value: '100% waived' },
      { label: 'Charging Infrastructure', value: '50% capex subsidy for EVSE setups' },
    ],
    notes: 'Gujarat has one of India\'s most EV-friendly climates for manufacturing (Tata, Suzuki, MG all have plants). State provides additional support to EV fleet operators and autorickshaw drivers.',
    color: 'border-yellow-200 bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    state: 'Karnataka',
    flag: '💻',
    policy: 'Karnataka EV Policy 2023–2028',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹5,000' },
      { label: 'Four-Wheeler Subsidy', value: 'Road tax concession only' },
      { label: 'Road Tax Waiver', value: '100% for BEVs, 50% for HEVs' },
      { label: 'Registration Fee', value: 'Waived for BEVs' },
      { label: 'Manufacturing Incentive', value: 'Capital subsidy up to ₹100 Cr for EV makers' },
      { label: 'Charging Hubs', value: 'Public charging at every 25 km on national highways' },
    ],
    notes: 'Karnataka (Bengaluru) is India\'s EV tech hub. Ola Electric, Bounce Infinity and many EV startups are headquartered here. The policy focuses heavily on manufacturing ecosystem.',
    color: 'border-purple-200 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    state: 'Rajasthan',
    flag: '🏜️',
    policy: 'Rajasthan EV Policy 2022',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹10,000' },
      { label: 'Three-Wheeler Subsidy', value: 'Up to ₹20,000' },
      { label: 'Four-Wheeler Subsidy', value: 'Road tax exemption (up to ₹2,000)' },
      { label: 'Road Tax Waiver', value: '100% for BEVs' },
      { label: 'Registration Fee', value: 'Waived' },
      { label: 'Solar+EV Package', value: 'Special incentive for solar-charged EV homes' },
    ],
    notes: 'Rajasthan leverages its abundant solar energy for EV charging. The state targets 50,000 EVs on road by 2025 and is building solar charging corridors on major highways.',
    color: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    state: 'Tamil Nadu',
    flag: '🌊',
    policy: 'Tamil Nadu EV Policy 2023',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹5,000' },
      { label: 'Three-Wheeler Subsidy', value: 'Up to ₹30,000' },
      { label: 'Four-Wheeler Subsidy', value: 'Road tax concession' },
      { label: 'Road Tax Waiver', value: '100% for BEVs' },
      { label: 'Registration Fee', value: 'Waived for BEVs' },
      { label: 'EV Manufacturing', value: 'Generous capex subsidy + land incentives for OEMs' },
    ],
    notes: 'Tamil Nadu is India\'s auto manufacturing powerhouse (Chennai = Detroit of Asia). Hyundai, Ford, TVS, Ather all manufacture here. The state targets 10 lakh EV sales by 2030.',
    color: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    state: 'Uttar Pradesh',
    flag: '🕌',
    policy: 'UP EV Manufacturing & Mobility Policy 2022',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹5,000 for first 2 lakh buyers' },
      { label: 'Three-Wheeler Subsidy', value: 'Up to ₹12,000 for first 1 lakh buyers' },
      { label: 'Four-Wheeler Subsidy', value: 'Up to ₹1,00,000 for first 25,000 buyers' },
      { label: 'Road Tax Waiver', value: '100% for 3 years' },
      { label: 'Registration Fee', value: 'Waived' },
      { label: 'E-Bus Subsidy', value: '15% capital subsidy for e-bus operators' },
    ],
    notes: 'UP is India\'s most populous state and has aggressive EV targets. Lucknow, Noida and Agra are priority EV cities. The policy offers strong incentives for commercial fleet operators including auto-rickshaws.',
    color: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
  {
    state: 'Telangana',
    flag: '💎',
    policy: 'Telangana EV Policy 2023–2027',
    status: 'active',
    subsidies: [
      { label: 'Two-Wheeler Subsidy', value: 'Up to ₹10,000' },
      { label: 'Four-Wheeler Subsidy', value: 'Road tax exemption' },
      { label: 'Road Tax Waiver', value: '100% for BEVs' },
      { label: 'Registration Fee', value: 'Waived for BEVs' },
      { label: 'Charging Infrastructure', value: '25% capex subsidy for EVSE installers' },
      { label: 'Hyderabad Fast Lanes', value: 'Priority parking + HOV lane access for EVs' },
    ],
    notes: 'Telangana (Hyderabad) is rapidly becoming an EV hub with Tata Motors\' EV plant and multiple charging network operators. The state targets 10% EV penetration in 2-wheelers by 2027.',
    color: 'border-teal-200 bg-teal-50',
    badge: 'bg-teal-100 text-teal-700',
  },
]

const CENTRAL = [
  {
    scheme: 'FAME-II (Faster Adoption and Manufacturing of EVs)',
    desc: 'Central government subsidy on purchase price. Phase II ended March 2024; awaiting FAME-III announcement under PM E-DRIVE scheme.',
    twoW: 'Ended (was ₹15,000–20,000)',
    threeW: 'Ended (was ₹30,000–50,000)',
    fourW: 'Ended (was up to ₹1.5 lakh)',
    bus: 'Up to ₹45 lakh per e-bus (continuing)',
  },
  {
    scheme: 'PM E-DRIVE Scheme (2024–2026)',
    desc: 'Replacement for FAME-II. ₹10,900 crore allocated for EV demand incentives, charging infrastructure and e-buses.',
    twoW: 'Up to ₹10,000 (expected)',
    threeW: 'Up to ₹25,000 (expected)',
    fourW: 'TBD (scheme details under finalisation)',
    bus: 'Up to ₹45 lakh per e-bus',
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which state gives the highest EV subsidy in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Delhi offers the highest EV subsidy in India for two-wheelers and four-wheelers. Delhi's EV Policy provides up to ₹30,000 subsidy on electric two-wheelers and up to ₹1.5 lakh on four-wheelers for the first 1,000 buyers. Additionally, Delhi provides 100% road tax waiver and registration fee exemption, making it the most generous EV incentive package in India."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a central government EV subsidy in India 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FAME-II ended in March 2024. The central government launched the PM E-DRIVE scheme in 2024 with ₹10,900 crore allocated for EV incentives, charging infrastructure and e-buses. Under PM E-DRIVE, subsidies of up to ₹10,000 for two-wheelers and ₹25,000 for three-wheelers are expected. Four-wheeler subsidy details are awaited."
      }
    },
    {
      "@type": "Question",
      "name": "Can I get both central and state EV subsidy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, in most cases you can stack both central government (PM E-DRIVE / FAME) and state government EV subsidies. For example, a Delhi buyer purchasing an electric two-wheeler could potentially receive both the central scheme incentive and Delhi's state subsidy, along with 100% road tax waiver and registration fee exemption, making the total benefit very significant."
      }
    },
    {
      "@type": "Question",
      "name": "Are there any income tax benefits for EV purchase in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Section 80EEB of the Income Tax Act allows individual taxpayers to claim up to ₹1.5 lakh per year as deduction on interest paid on EV loans. This is available only for loans sanctioned between April 2019 and March 2025 (extended). Additionally, there is no GST charged on EV charging services, and EV manufacturers benefit from 5% GST vs 28%+ on petrol vehicles."
      }
    },
  ]
}

export default function EVSubsidyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "State-wise EV Subsidy in India 2026",
        "url": `${SITE_URL}/ev-subsidy`,
        "description": "Complete guide to state-wise and central government EV subsidies in India 2026.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
            { "@type": "ListItem", "position": 2, "name": "EV Subsidies India", "item": `${SITE_URL}/ev-subsidy` }
          ]
        }
      })}} />

      <main className="min-h-screen bg-gray-50 pb-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link href="/" className="hover:text-green-600">Home</Link>
              <ChevronRight size={12} />
              <Link href="/ev-subsidy" className="text-gray-800 font-semibold">State EV Subsidies</Link>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Hero */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-4">
              <MapPin size={15} /> Updated July 2026
            </div>
            <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">EV Subsidies in India – State-wise Guide</h1>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">A complete breakdown of electric vehicle subsidies, road tax waivers, and registration benefits across all major Indian states — so you know exactly how much you can save.</p>
          </div>

          {/* Quick summary banner */}
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-700 to-green-500 p-6 text-white">
            <h2 className="text-lg font-black mb-4">Key EV Benefits Available in India</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: '💰', value: 'Up to ₹1.5L', label: 'Purchase Subsidy' },
                { emoji: '🚗', value: '100%', label: 'Road Tax Waiver' },
                { emoji: '📑', value: '100%', label: 'Reg. Fee Waived' },
                { emoji: '🧾', value: '₹1.5L/yr', label: 'IT Deduction (80EEB)' },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white/20 px-4 py-3 text-center">
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className="font-black text-xl">{s.value}</div>
                  <div className="text-xs text-green-100">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Central Government */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Central Government Schemes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {CENTRAL.map(scheme => (
                <div key={scheme.scheme} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="font-black text-gray-800 mb-2">{scheme.scheme}</h3>
                  <p className="text-xs text-gray-500 mb-3">{scheme.desc}</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Two-Wheeler', value: scheme.twoW },
                      { label: 'Three-Wheeler', value: scheme.threeW },
                      { label: 'Four-Wheeler', value: scheme.fourW },
                      { label: 'E-Bus', value: scheme.bus },
                    ].map(row => (
                      <div key={row.label} className="flex items-start gap-2 text-xs">
                        <span className="mt-0.5 text-green-500 shrink-0"><CheckCircle size={12} /></span>
                        <span className="text-gray-500">{row.label}:</span>
                        <span className="text-gray-800 font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* State-wise */}
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">State-wise EV Subsidies</h2>
            <div className="space-y-4">
              {STATES.map(s => (
                <div key={s.state} className={`rounded-2xl border p-5 ${s.color}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{s.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-gray-900">{s.state}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.badge}`}>{s.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{s.policy}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 mb-4">
                    {s.subsidies.map(sub => (
                      <div key={sub.label} className="flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2">
                        <IndianRupee size={13} className="mt-0.5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-700">{sub.label}</p>
                          <p className="text-xs text-gray-600">{sub.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{s.notes}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-5">Frequently Asked Questions</h2>
            {faqJsonLd.mainEntity.map((faq, i) => (
              <details key={i} className="border-b border-gray-100 last:border-0 py-3">
                <summary className="cursor-pointer font-semibold text-gray-800 text-sm">{faq.name}</summary>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </section>

          {/* Disclaimer */}
          <div className="mt-6 rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>Disclaimer:</strong> Subsidy amounts and eligibility conditions change frequently. Always verify the current subsidy status with your state&apos;s Transport Department or the vehicle dealer before purchase. Some schemes have limited quotas and may be exhausted. Last updated July 2026.
            </p>
          </div>

          {/* Related Tools */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/emi-calculator" className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-300 transition">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">🧮</div>
              <div>
                <p className="font-bold text-gray-800">EV EMI Calculator</p>
                <p className="text-xs text-gray-500">Calculate your monthly payment</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-gray-300" />
            </Link>
            <Link href="/ev-vs-petrol" className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-300 transition">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">🍃</div>
              <div>
                <p className="font-bold text-gray-800">EV vs Petrol Calculator</p>
                <p className="text-xs text-gray-500">How much you save per month</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-gray-300" />
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
