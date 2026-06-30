import CompareClient from "./CompareClient";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "Compare Electric Vehicles – Cars & Bikes Side by Side | EV News India",
  description:
    "Compare electric cars and bikes side by side. Check specs, range, motor, price and features of top EVs in India.",
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "Compare Electric Vehicles Side by Side | EV News India",
    description: "Compare specs, range, motor, price and features of top electric cars and bikes in India side by side.",
    url: `${SITE_URL}/compare`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Compare Electric Vehicles&subtitle=Side-by-side specs, range %26 price comparison&tag=cars&type=page`, width: 1200, height: 630, alt: "Compare Electric Vehicles" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Electric Vehicles Side by Side",
    description: "Compare EV specs, range, motor, price and features of top electric cars and bikes in India.",
    images: [`${SITE_URL}/api/og?title=Compare Electric Vehicles&subtitle=Side-by-side specs, range %26 price comparison&tag=cars&type=page`],
  },
};

const compareJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EV Comparison Tool – EV News India",
  url: `${SITE_URL}/compare`,
  description: "Compare electric cars and bikes side by side. Check specs, range, motor, price and features of top EVs in India.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@type": "Organization", name: "EV News India", url: SITE_URL },
};

const compareFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which electric car has the longest range in India?",
      acceptedAnswer: { "@type": "Answer", text: "The Tata Harrier EV offers the longest real-world range among mainstream EVs in India at around 500 km. The Hyundai Ioniq 5 and BYD Atto 3 also offer 450–480 km of range. Premium imports like the BMW iX offer 600+ km." },
    },
    {
      "@type": "Question",
      name: "Which electric car is best under 15 lakh in India?",
      acceptedAnswer: { "@type": "Answer", text: "The Tata Nexon EV (₹14.49 lakh onwards) is the best electric car under ₹15 lakh in India offering 325 km of range, a 5-star safety rating, and a well-established service network. The Tata Tiago EV (₹8.69 lakh) is the most affordable option with 250 km of range." },
    },
    {
      "@type": "Question",
      name: "What is the difference between Tata Nexon EV and Punch EV?",
      acceptedAnswer: { "@type": "Answer", text: "The Tata Nexon EV is a compact SUV with a 325 km range and 45 kWh battery, while the Punch EV is a micro-SUV with a 315–421 km range and a 35–45 kWh battery. The Punch EV is slightly more affordable and has a higher seating position, while the Nexon EV has a larger boot space." },
    },
  ],
};

export default async function ComparePage({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareFaqJsonLd) }} />
      <CompareClient initialV0={sp?.v0 || null} initialV1={sp?.v1 || null} />
    </>
  );
}
