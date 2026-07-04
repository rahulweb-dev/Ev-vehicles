import { notFound }    from "next/navigation";
import { SITE_URL }     from "@/app/layout";
import CityPriceClient  from "./CityPriceClient";

export const revalidate = 86400;

const CITIES = [
  { slug: "mumbai",     name: "Mumbai",     state: "Maharashtra",    rto: "MH", regPct: 0.11, tax: 0 },
  { slug: "delhi",      name: "Delhi",      state: "Delhi",          rto: "DL", regPct: 0.04, tax: 0 },
  { slug: "bangalore",  name: "Bangalore",  state: "Karnataka",      rto: "KA", regPct: 0.13, tax: 0 },
  { slug: "hyderabad",  name: "Hyderabad",  state: "Telangana",      rto: "TS", regPct: 0.09, tax: 0 },
  { slug: "chennai",    name: "Chennai",    state: "Tamil Nadu",     rto: "TN", regPct: 0.10, tax: 0 },
  { slug: "pune",       name: "Pune",       state: "Maharashtra",    rto: "MH", regPct: 0.11, tax: 0 },
  { slug: "ahmedabad",  name: "Ahmedabad",  state: "Gujarat",        rto: "GJ", regPct: 0.06, tax: 0 },
  { slug: "kolkata",    name: "Kolkata",    state: "West Bengal",    rto: "WB", regPct: 0.07, tax: 0 },
  { slug: "jaipur",     name: "Jaipur",     state: "Rajasthan",      rto: "RJ", regPct: 0.09, tax: 0 },
  { slug: "lucknow",    name: "Lucknow",    state: "Uttar Pradesh",  rto: "UP", regPct: 0.08, tax: 0 },
  { slug: "chandigarh", name: "Chandigarh", state: "Chandigarh",     rto: "CH", regPct: 0.06, tax: 0 },
  { slug: "bhopal",     name: "Bhopal",     state: "Madhya Pradesh", rto: "MP", regPct: 0.08, tax: 0 },
];

// NOTE: folder is [city] so params.city = full URL segment e.g. "price-in-mumbai"
// Strip the "price-in-" prefix to get the city slug for CITIES lookup
function parseCitySlug(raw) {
  return (raw || "").replace(/^price-in-/, "");
}

export async function generateStaticParams() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const vehicles = await Vehicle.find({ vehicleType: "car", status: "published" }).select("slug").lean();
    return vehicles.flatMap(v =>
      CITIES.map(c => ({ slug: v.slug, city: `price-in-${c.slug}` }))
    );
  } catch {
    return [];
  }
}

async function getVehicle(slug) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.findOne({ slug, vehicleType: "car", status: "published" }).lean();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug, city: rawCity } = await params;
  const city     = parseCitySlug(rawCity);
  const cityData = CITIES.find(c => c.slug === city);
  if (!cityData) return { title: "Not Found" };

  const vehicle = await getVehicle(slug);
  if (!vehicle) return { title: "Not Found" };

  const year  = new Date().getFullYear();
  const price = vehicle.variants?.[0]?.exShowroomPrice || "";

  return {
    title:       `${vehicle.name} Price in ${cityData.name} ${year} – On-Road Price & EMI`,
    description: `${vehicle.name} on-road price in ${cityData.name} ${year}. Includes RTO, insurance, and state taxes.${price ? ` Ex-showroom starts at ${price}.` : ""} Compare variants and check EMI options.`,
    keywords:    `${vehicle.name} price in ${cityData.name}, ${vehicle.name} on road price ${cityData.name}, ${vehicle.name} ${cityData.name}, EV price ${cityData.name}`,
    alternates:  { canonical: `${SITE_URL}/cars/${slug}/price-in-${city}` },
    openGraph: {
      title:       `${vehicle.name} Price in ${cityData.name} ${year}`,
      description: `On-road price of ${vehicle.name} in ${cityData.name} with RTO, insurance, and all charges.`,
      url: `${SITE_URL}/cars/${slug}/price-in-${city}`,
      type: "website",
      images: [{
        url: vehicle.featuredImage ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(vehicle.name + " Price in " + cityData.name)}&subtitle=${encodeURIComponent("On-road price with RTO, insurance & taxes")}&type=vehicle&tag=cars`,
        width: 1200, height: 630,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${vehicle.name} Price in ${cityData.name} ${year}`,
      description: `On-road price of ${vehicle.name} in ${cityData.name} with RTO, insurance, and all charges.`,
      images: [vehicle.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(vehicle.name + " Price in " + cityData.name)}&subtitle=${encodeURIComponent("On-road price with RTO, insurance & taxes")}&type=vehicle&tag=cars`],
    },
  };
}

export default async function CityPricePage({ params }) {
  const { slug, city: rawCity } = await params;
  const city     = parseCitySlug(rawCity);
  const cityData = CITIES.find(c => c.slug === city);
  if (!cityData) notFound();

  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  const year      = new Date().getFullYear();
  const exNum     = parseInt((vehicle.variants?.[0]?.exShowroomPrice || "").replace(/[^0-9]/g, "")) || 0;
  const onRoadNum = exNum ? Math.round(exNum * (1 + cityData.regPct + 0.028 * 0.88 + 0.03)) : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "Product",
    name:       `${vehicle.name} On-Road Price in ${cityData.name}`,
    brand:      { "@type": "Brand", name: vehicle.brand },
    description: `${vehicle.name} on-road price in ${cityData.name} ${year} including RTO, insurance and accessories.`,
    image:       vehicle.featuredImage || "",
    url:         `${SITE_URL}/cars/${slug}/price-in-${city}`,
    ...(onRoadNum && {
      offers: {
        "@type":         "Offer",
        priceCurrency:   "INR",
        price:           onRoadNum,
        priceValidUntil: `${year}-12-31`,
        availability:    "https://schema.org/InStock",
        itemCondition:   "https://schema.org/NewCondition",
        url:             `${SITE_URL}/cars/${slug}/price-in-${city}`,
        areaServed:      { "@type": "City", name: cityData.name },
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",                     item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Cars",            item: `${SITE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: vehicle.name,               item: `${SITE_URL}/cars/${slug}` },
      { "@type": "ListItem", position: 4, name: `Price in ${cityData.name}`, item: `${SITE_URL}/cars/${slug}/price-in-${city}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:    `What is the on-road price of ${vehicle.name} in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: onRoadNum
            ? `The on-road price of ${vehicle.name} in ${cityData.name} is approximately ₹${onRoadNum.toLocaleString("en-IN")} including RTO (${Math.round(cityData.regPct * 100)}%), insurance, and accessories.`
            : `The on-road price of ${vehicle.name} in ${cityData.name} includes the ex-showroom price plus RTO charges, insurance, and handling fees.`,
        },
      },
      {
        "@type": "Question",
        name:    `What is the RTO charge for ${vehicle.name} in ${cityData.state}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `In ${cityData.state}, the road tax for electric vehicles is ${Math.round(cityData.regPct * 100)}% of the ex-showroom price. Many states offer reduced road tax for EVs to promote adoption.`,
        },
      },
      {
        "@type": "Question",
        name:    `Is ${vehicle.name} available in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, the ${vehicle.name} is available at authorised ${vehicle.brand} dealerships in ${cityData.name}, ${cityData.state}. You can book a test drive or get exact pricing from the dealer.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <CityPriceClient
        vehicle={JSON.parse(JSON.stringify(vehicle))}
        cityData={cityData}
        allCities={CITIES}
      />
    </>
  );
}
