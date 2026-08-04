import EVQuizClient from "./EVQuizClient";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Which EV is Right for You? – Free EV Finder Quiz India 2026",
  description: "Answer 6 quick questions and find the perfect electric vehicle for your needs and budget. Compare EVs by range, price, and lifestyle in India.",
  keywords: "which ev should i buy india, best ev for me, ev recommendation quiz, electric car selector india",
  alternates: { canonical: `${SITE_URL}/ev-quiz` },
  openGraph: {
    title: "Which EV is Right for You? Take the Quiz!",
    description: "Answer 6 questions and get your personalised EV recommendation for India.",
    images: [{ url: `${SITE_URL}/api/og?title=Which EV is Right for You?&subtitle=Free EV Finder Quiz • India 2026&tag=quiz`, width: 1200, height: 630 }],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EV Finder Quiz – Which EV Should I Buy in India?",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/ev-quiz`,
    description: "A free 6-question quiz that recommends the best electric vehicle for your budget, lifestyle, and driving needs in India.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which electric car should I buy in India in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The best EV for you depends on your budget, daily range needs, and charging setup. Take our free EV Finder Quiz to get a personalised recommendation. Popular choices include Tata Nexon EV (₹14–20 lakh), Tata Punch EV (₹10–14 lakh), MG Windsor (₹14–16 lakh), and Mahindra BE 6 (₹19–26 lakh).",
        },
      },
      {
        "@type": "Question",
        name: "Which electric scooter is best in India 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Top electric scooters in India include Ola S1 Pro (₹1.4 lakh), Ather 450X (₹1.5 lakh), Bajaj Chetak (₹1.2 lakh), and TVS iQube (₹1.2 lakh). The best pick depends on range, charging speed, and brand service network in your city.",
        },
      },
      {
        "@type": "Question",
        name: "What range do I need for an EV in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For city commutes under 40 km/day, an EV with 200–300 km certified range is more than sufficient. For highway and inter-city travel, look for 400 km+ real-world range. Most popular Indian EVs offer 300–450 km MIDC range.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "EV Quiz", item: `${SITE_URL}/ev-quiz` },
    ],
  },
];

export default function EVQuizPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      {/* Server-rendered intro ensures Googlebot sees substantive text, not just the interactive quiz */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Which EV Is Right for You?</h1>
        <p className="text-gray-600 leading-relaxed mb-1">
          Answer 6 quick questions about your budget, daily driving distance, and charging setup — and our EV Finder will recommend the best electric car or scooter for your needs from India&apos;s complete 2026 lineup. The quiz covers everything from entry-level EVs under ₹10 lakh to premium electric SUVs, so every type of buyer gets a personalised shortlist with real prices and verified range figures.
        </p>
      </div>
      <EVQuizClient />
    </>
  );
}
