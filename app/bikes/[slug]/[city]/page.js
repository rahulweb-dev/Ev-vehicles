import { notFound }         from "next/navigation";
import { permanentRedirect } from "next/navigation";

import { getCity } from "@/lib/cityPricing";

function parseCitySlug(raw) {
  return (raw || "").replace(/^price-in-/, "");
}

// No static params — this route only exists to 301-redirect legacy URLs
// to the canonical /bikes/[slug]/price-in-[city] pattern
export async function generateStaticParams() {
  return [];
}

export default async function BikeCityPriceRedirect({ params }) {
  const { slug, city: rawCity } = await params;
  const city = parseCitySlug(rawCity);
  if (!getCity(city)) notFound();
  permanentRedirect(`/bikes/${slug}/price-in-${city}`);
}
