import { notFound } from "next/navigation";
import { cache } from "react";
import CityPricePage, { cityPriceMetadata } from "@/components/vehicles/CityPricePage";
import { getCity, TOP_CITY_SLUGS } from "@/lib/cityPricing";

// On-road price in a city. Road-tax rules live in lib/city-tax-data.json (verified per state).
export const revalidate = 86400;

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

// Pre-build the original 12 metro pages; the other cities render on first visit and are cached.
export async function generateStaticParams() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const list = await Vehicle.find({ vehicleType: "bike", status: "published" }).select("slug").lean();
    return list.flatMap((v) => TOP_CITY_SLUGS.map((city) => ({ slug: v.slug, city })));
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug, city } = await params;
  if (!getCity(city)) return { title: "Page Not Found" };
  const vehicle = await getVehicle(slug);
  if (!vehicle) return { title: "Not Found" };
  return cityPriceMetadata(vehicle, "bike", city);
}

export default async function Page({ params }) {
  const { slug, city } = await params;
  if (!getCity(city)) notFound();
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();
  return <CityPricePage vehicle={vehicle} type="bike" citySlug={city} />;
}
