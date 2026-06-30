import RangeCalculatorClient from "./RangeCalculatorClient";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "EV Range Calculator India – Real-World Range Estimator 2026",
  description: "Calculate real-world EV range based on driving style, AC usage, speed, and weather. Find your electric vehicle's actual range in Indian conditions.",
  keywords: "ev range calculator india, electric car real range india, ev range estimator, how far can ev go india",
  alternates: { canonical: `${SITE_URL}/range-calculator` },
  openGraph: {
    title: "EV Range Calculator India – How Far Can Your Electric Car Go?",
    description: "Get accurate real-world range estimates for your EV based on Indian driving conditions.",
    images: [{ url: `${SITE_URL}/api/og?title=EV Range Calculator&subtitle=Real-world range for Indian conditions&tag=tools`, width: 1200, height: 630 }],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EV Real-World Range Calculator India",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/range-calculator`,
    description: "Free tool to estimate the real-world driving range of electric vehicles under Indian conditions — accounting for AC usage, speed, traffic, and temperature.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "Real-world range vs certified MIDC range",
      "AC and climate impact calculation",
      "City vs highway range comparison",
      "Speed-based range modelling",
      "India-specific temperature adjustment",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why is my EV's real range less than the certified range?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Certified range figures (MIDC/ARAI in India) are measured under controlled conditions. Real-world range is typically 15–30% lower due to AC usage, higher speeds, traffic conditions, driving style, and ambient temperature. In hot Indian summers, range can drop by 20–30% with AC on.",
        },
      },
      {
        "@type": "Question",
        name: "How does AC usage affect EV range in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Air conditioning is the biggest range reducer in Indian conditions. Running AC at full blast can reduce EV range by 20–35% depending on the model. Pre-conditioning the cabin while plugged in, using fan-only mode at lower speeds, and parking in shade can help preserve range.",
        },
      },
      {
        "@type": "Question",
        name: "What is the real-world range of the Tata Nexon EV?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Tata Nexon EV Max has a certified MIDC range of 437 km. Real-world range in Indian conditions is typically 280–340 km in city driving with AC, and 310–370 km on highways at moderate speeds.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",             item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Range Calculator", item: `${SITE_URL}/range-calculator` },
    ],
  },
];

export default function RangeCalculatorPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <RangeCalculatorClient />
    </>
  );
}
