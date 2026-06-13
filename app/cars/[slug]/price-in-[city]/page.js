import { notFound }    from "next/navigation";
import { SITE_URL }     from "@/app/layout";
import CityPriceClient  from "./CityPriceClient";

export const revalidate = 86400;

const CITIES = [
  { slug: "mumbai",    name: "Mumbai",    state: "Maharashtra", rto: "MH",  regPct: 0.11, tax: 0 },
  { slug: "delhi",     name: "Delhi",     state: "Delhi",       rto: "DL",  regPct: 0.04, tax: 0 },
  { slug: "bangalore", name: "Bangalore", state: "Karnataka",   rto: "KA",  regPct: 0.13, tax: 0 },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana",   rto: "TS",  regPct: 0.09, tax: 0 },
  { slug: "chennai",   name: "Chennai",   state: "Tamil Nadu",  rto: "TN",  regPct: 0.10, tax: 0 },
  { slug: "pune",      name: "Pune",      state: "Maharashtra", rto: "MH",  regPct: 0.11, tax: 0 },
  { slug: "ahmedabad", name: "Ahmedabad", state: "Gujarat",     rto: "GJ",  regPct: 0.06, tax: 0 },
  { slug: "kolkata",   name: "Kolkata",   state: "West Bengal", rto: "WB",  regPct: 0.07, tax: 0 },
  { slug: "jaipur",    name: "Jaipur",    state: "Rajasthan",   rto: "RJ",  regPct: 0.09, tax: 0 },
  { slug: "lucknow",   name: "Lucknow",   state: "Uttar Pradesh", rto: "UP", regPct: 0.08, tax: 0 },
  { slug: "chandigarh",name: "Chandigarh",state: "Chandigarh",  rto: "CH",  regPct: 0.06, tax: 0 },
  { slug: "bhopal",    name: "Bhopal",    state: "Madhya Pradesh", rto: "MP", regPct: 0.08, tax: 0 },
];

export async function generateStaticParams() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const vehicles = await Vehicle.find({ vehicleType: "car", status: "published" }).select("slug").lean();
    return vehicles.flatMap(v => CITIES.map(c => ({ slug: v.slug, city: c.slug })));
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
  const { slug, city } = await params;
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
      images:      [{ url: vehicle.featuredImage || "", width: 1200, height: 630 }],
    },
  };
}

export default async function CityPricePage({ params }) {
  const { slug, city } = await params;
  const cityData = CITIES.find(c => c.slug === city);
  if (!cityData) notFound();

  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  return (
    <CityPriceClient
      vehicle={JSON.parse(JSON.stringify(vehicle))}
      cityData={cityData}
      allCities={CITIES}
    />
  );
}
