import Link from "next/link";
import { IndianRupee, Zap, CheckCircle, ExternalLink, Info, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/app/layout";

const subsidyFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the FAME III subsidy amount for electric vehicles in India?",
      acceptedAnswer: { "@type": "Answer", text: "The proposed FAME III scheme (expected 2024–2029) is expected to offer up to ₹50,000 subsidy on electric 2-wheelers and up to ₹2.5 lakh on electric 4-wheelers for vehicles manufactured in India with minimum local content requirements." },
    },
    {
      "@type": "Question",
      name: "Which state gives the highest EV subsidy in India?",
      acceptedAnswer: { "@type": "Answer", text: "Delhi offers the highest EV subsidies in India — up to ₹30,000 for electric 2-wheelers and ₹1.5 lakh for electric 4-wheelers under the Delhi EV Policy 2020, along with road tax and registration fee waiver. Gujarat, Maharashtra, and Rajasthan also offer significant subsidies." },
    },
    {
      "@type": "Question",
      name: "What is Section 80EEB tax benefit for electric vehicles?",
      acceptedAnswer: { "@type": "Answer", text: "Section 80EEB of the Income Tax Act allows a deduction of up to ₹1.5 lakh per year on interest paid on loans taken for purchasing an electric vehicle. This benefit is available for individual taxpayers who purchase an EV on loan from a financial institution." },
    },
    {
      "@type": "Question",
      name: "How do I claim EV subsidy in India?",
      acceptedAnswer: { "@type": "Answer", text: "You don't need to apply directly — the subsidy is deducted upfront from your invoice by the authorized EV dealer. Simply visit an authorized dealer, select your EV, provide KYC documents (Aadhaar, PAN), and the dealer applies for the subsidy via the FAME/state portal on your behalf. The subsidy amount is deducted from the price you pay." },
    },
  ],
};

const subsidyBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "EV Subsidies India 2026", item: `${SITE_URL}/subsidies` },
  ],
};

export const metadata = {
  title: "EV Subsidies & Government Schemes 2026 – FAME III, State Incentives",
  description: "Complete guide to EV subsidies in India 2026. FAME III scheme, state-wise incentives, tax benefits, and how to claim them.",
  alternates: { canonical: `${SITE_URL}/subsidies` },
  openGraph: {
    title: "EV Subsidies & Government Schemes 2026 – FAME III, State Incentives",
    description: "Complete guide to EV subsidies in India. FAME III scheme, state-wise incentives, Section 80EEB tax benefits and how to claim them.",
    url: `${SITE_URL}/subsidies`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Subsidies India 2026&subtitle=FAME III, state incentives %26 tax benefits guide&tag=charging&type=page`, width: 1200, height: 630, alt: "EV Subsidies India 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Subsidies India 2026 – FAME III & State Incentives",
    description: "Complete guide to EV subsidies in India. FAME III scheme, state-wise incentives and tax benefits.",
    images: [`${SITE_URL}/api/og?title=EV Subsidies India 2026&subtitle=FAME III, state incentives %26 tax benefits guide&tag=charging&type=page`],
  },
};

const CENTRAL_SCHEMES = [
  {
    name: "FAME III (Proposed)",
    ministry: "Ministry of Heavy Industries",
    status: "Proposed / In Pipeline",
    statusColor: "orange",
    budget: "₹10,000 Crore (Expected)",
    benefit: "Up to ₹50,000 on 2-wheelers, Up to ₹2.5 Lakh on 4-wheelers",
    eligibility: "Indian-made EVs with minimum local content requirement",
    validity: "2024–2029 (Expected)",
    details: "The FAME III scheme is expected to continue support for electric 2-wheelers, 3-wheelers, buses, and 4-wheelers with higher subsidy amounts than FAME II.",
  },
  {
    name: "PLI Scheme for Advanced Chemistry Cell",
    ministry: "Ministry of Heavy Industries",
    status: "Active",
    statusColor: "green",
    budget: "₹18,100 Crore",
    benefit: "Production incentive for EV battery manufacturers",
    eligibility: "Battery manufacturers setting up in India",
    validity: "2021–2030",
    details: "Encourages domestic manufacturing of advanced chemistry cell batteries, reducing India's dependence on imports.",
  },
  {
    name: "PLI Scheme for Automobile & Auto Components",
    ministry: "Ministry of Heavy Industries",
    status: "Active",
    statusColor: "green",
    budget: "₹25,938 Crore",
    benefit: "5–18% incentive on incremental sales of EVs",
    eligibility: "Auto manufacturers producing EVs / EV components in India",
    validity: "2022–2027",
    details: "Boosts domestic EV production by incentivising companies to manufacture EVs in India.",
  },
  {
    name: "Customs Duty Exemption on EV Parts",
    ministry: "Ministry of Finance",
    status: "Active",
    statusColor: "green",
    budget: "Ongoing",
    benefit: "Reduced import duty on EV-specific parts",
    eligibility: "EV manufacturers importing capital goods for EV production",
    validity: "Ongoing",
    details: "Capital goods required for EV manufacturing are exempt from customs duty to reduce production costs.",
  },
];

const STATE_SCHEMES = [
  { state: "Delhi",         subsidy: "Up to ₹1.5 Lakh",   tax: "No road tax",                   note: "Strong push for EVs; scrapping incentive available" },
  { state: "Maharashtra",   subsidy: "Up to ₹1 Lakh",     tax: "Waiver on registration",         note: "MEVP scheme; charging infra incentive for housing societies" },
  { state: "Gujarat",       subsidy: "Up to ₹20,000",     tax: "Road tax waiver",                note: "Early mover EV policy; supports electric 2W & 4W" },
  { state: "Karnataka",     subsidy: "Up to ₹25,000",     tax: "100% road tax waiver",           note: "Karnataka EV Policy 2021-26; Bengaluru charging push" },
  { state: "Tamil Nadu",    subsidy: "Up to ₹15,000",     tax: "Tax concession on EVs",          note: "Tamil Nadu EV Policy 2023; manufacturing incentives" },
  { state: "Rajasthan",     subsidy: "Up to ₹10,000",     tax: "Road tax exemption",             note: "Rajasthan EV Policy 2022" },
  { state: "Uttar Pradesh", subsidy: "Up to ₹20,000",     tax: "One-time tax waiver",            note: "EV Manufacturing Policy 2022" },
  { state: "Andhra Pradesh",subsidy: "Up to ₹10,000",     tax: "100% road tax exemption",        note: "AP EV Policy 2023" },
  { state: "Telangana",     subsidy: "Up to ₹30,000",     tax: "Road tax exemption",             note: "Telangana EV Policy 2020-30; hub focus" },
  { state: "Goa",           subsidy: "Up to ₹30,000",     tax: "Road tax exemption",             note: "Goa EV Policy 2021; best subsidy per capita" },
  { state: "Kerala",        subsidy: "Up to ₹15,000",     tax: "Motor vehicle tax reduction",    note: "Green Kerala push; coastal city coverage" },
  { state: "Punjab",        subsidy: "Up to ₹10,000",     tax: "Road tax waiver",                note: "Punjab EV Policy 2022" },
];

const TAX_BENEFITS = [
  { title: "Section 80EEB – Income Tax Deduction", desc: "Deduction of up to ₹1.5 Lakh on interest paid on EV loan under Section 80EEB of the Income Tax Act (for individual taxpayers)." },
  { title: "Reduced GST on EVs", desc: "GST on electric vehicles reduced from 12% to 5%. GST on EV chargers reduced from 18% to 5%." },
  { title: "No Pollution Under Control (PUC) required", desc: "EVs are exempt from mandatory PUC certificates, saving time and annual expense." },
];

export default function SubsidiesPage() {
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(subsidyFaqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(subsidyBreadcrumbJsonLd) }} />
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-green-600">EV Subsidies & Schemes</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
              <IndianRupee size={22} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">EV Subsidies & Government Schemes 2026</h1>
              <p className="text-sm text-gray-500 mt-0.5">Central + State incentives, tax benefits, and how to claim them</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 mt-4">
            <Info size={16} className="shrink-0" />
            Subsidy amounts and policies change frequently. Always verify with your dealer or the official government portal before purchase.
          </div>
        </div>

        {/* Central Schemes */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
            <Zap size={20} className="text-green-600" /> Central Government Schemes
          </h2>
          <div className="space-y-4">
            {CENTRAL_SCHEMES.map((scheme) => (
              <div key={scheme.name} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-base font-black text-gray-900">{scheme.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{scheme.ministry}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    scheme.statusColor === "green" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {scheme.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{scheme.details}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-green-600 mb-0.5">Benefit</p>
                    <p className="font-semibold text-gray-900">{scheme.benefit}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 mb-0.5">Budget</p>
                    <p className="font-semibold text-gray-900">{scheme.budget}</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-purple-600 mb-0.5">Valid Till</p>
                    <p className="font-semibold text-gray-900">{scheme.validity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* State Schemes */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-black text-gray-900">State-wise EV Incentives</h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">State</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Subsidy</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Tax Benefit</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 hidden lg:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {STATE_SCHEMES.map((s, i) => (
                  <tr key={s.state} className={`border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-bold text-gray-900">{s.state}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">{s.subsidy}</td>
                    <td className="px-4 py-3 text-gray-700">{s.tax}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tax Benefits */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-black text-gray-900">Tax Benefits for EV Buyers</h2>
          <div className="space-y-3">
            {TAX_BENEFITS.map((t) => (
              <div key={t.title} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-600" />
                <div>
                  <h3 className="text-sm font-black text-gray-900">{t.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-600">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to claim */}
        <section className="rounded-2xl bg-green-600 p-6 text-white">
          <h2 className="text-xl font-black mb-4">How to Claim EV Subsidy</h2>
          <ol className="space-y-3">
            {[
              "Visit an authorised EV dealer and select your vehicle.",
              "Provide KYC documents: Aadhaar, PAN, address proof.",
              "The dealer applies for subsidy on your behalf via the FAME/state portal.",
              "Subsidy is deducted from the invoice amount upfront (you pay the reduced price directly).",
              "For income tax deduction under 80EEB, claim it during ITR filing with your loan repayment certificate.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">{i + 1}</span>
                <span className="text-sm text-green-100">{step}</span>
              </li>
            ))}
          </ol>
          <a href="https://fame2.heavyindustry.gov.in/" target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-50">
            Official FAME Portal <ExternalLink size={14} />
          </a>
        </section>
      </div>
    </div>
    </>
  );
}
