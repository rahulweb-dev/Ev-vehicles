import { notFound }         from "next/navigation";
import { permanentRedirect } from "next/navigation";

const VALID_CITIES = ["mumbai", "delhi", "bangalore", "hyderabad", "chennai", "pune", "ahmedabad", "kolkata", "jaipur", "lucknow", "chandigarh", "bhopal"];

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
  if (!VALID_CITIES.includes(city)) notFound();
  permanentRedirect(`/bikes/${slug}/price-in-${city}`);
}
