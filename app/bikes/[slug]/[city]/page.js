import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import CityPricePage, { cityPriceMetadata } from "@/components/vehicles/CityPricePage";
import { getCity } from "@/lib/cityPricing";

// /bikes/<slug>/price-in-<city> — on-road price in a city (road-tax rules: lib/city-tax-data.json).
// Next.js has no partial dynamic segments, so this single [city] route receives "price-in-pune":
// it renders the price page for that form and 301-redirects the bare "/<city>" form to it.
export const revalidate = 86400;

const PREFIX = "price-in-";

const getVehicle = cache(async (slug) => {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.findOne({ slug, vehicleType: "bike", status: "published" })
      .select("name brand slug featuredImage variants performance availability")
      .lean();
  } catch { return null; }
});

export async function generateMetadata({ params }) {
  const { slug, city: raw } = await params;
  if (!raw?.startsWith(PREFIX)) return {};
  const city = raw.slice(PREFIX.length);
  if (!getCity(city)) return { title: "Page Not Found" };
  const vehicle = await getVehicle(slug);
  if (!vehicle) return { title: "Not Found" };
  return cityPriceMetadata(vehicle, "bike", city);
}

export default async function Page({ params }) {
  const { slug, city: raw } = await params;
  if (!raw?.startsWith(PREFIX)) {
    if (getCity(raw)) permanentRedirect(`/bikes/${slug}/${PREFIX}${raw}`);
    notFound();
  }
  const city = raw.slice(PREFIX.length);
  if (!getCity(city)) notFound();
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();
  return <CityPricePage vehicle={vehicle} type="bike" citySlug={city} />;
}
