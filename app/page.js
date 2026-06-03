import EVHomepage from "@/components/home/HeroSection";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import VehicleSlider from "@/components/home/VehicleSlider";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "./layout";

export const revalidate = 120; // re-fetch from DB every 2 minutes

export const metadata = {
  title: "EV News India – India's #1 Electric Vehicle News Platform",
  description:
    "India's most trusted electric vehicle news platform. Get latest EV news, reviews, prices, and buying guides for electric cars, bikes, scooters, and commercial vehicles in India.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "EV News India – India's #1 Electric Vehicle News Platform",
    description: "Latest EV news, launches, reviews and prices for electric cars and bikes in India.",
    url: SITE_URL,
    type: "website",
  },
};

/* ── Map MongoDB Vehicle → VehicleSlider card format ─────────────── */
function mapVehicle(v) {
  const firstVariant = v.variants?.[0];
  const lastVariant  = v.variants?.[v.variants.length - 1];
  // Map DB colors (objects with hexCode) to hex strings for the slider swatches
  const colors = (v.colors || []).map((c) =>
    typeof c === "string" ? c : (c.hexCode || "#888888")
  );
  return {
    id:          v._id?.toString() || v.slug,
    slug:        v.slug,
    name:        v.name,
    brand:       v.brand,
    price:       firstVariant?.exShowroomPrice || "Price TBA",
    priceMax:    lastVariant?.exShowroomPrice  || firstVariant?.exShowroomPrice || "",
    emi:         "",
    image:       v.featuredImage || "",
    speed:       v.performance?.topSpeed    || "—",
    range:       v.performance?.drivingRange || v.variants?.[0]?.range || "—",
    motor:       v.performance?.power       || "—",
    colors,
    rating:      0,
    reviewCount: 0,
    tag:         v.featured ? "Featured" : v.category === "upcoming" ? "Coming Soon" : "Popular",
  };
}

/* ── Fetch a section from MongoDB ────────────────────────────────── */
async function getVehicles({ category, vehicleType, featured }) {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const Vehicle   = (await import("@/lib/models/Vehicle")).default;
  await dbConnect();
  const filter = { vehicleType, status: "published" };
  if (category) filter.category = category;
  if (featured) filter.featured = true;
  const docs = await Vehicle.find(filter)
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
  return docs.map(mapVehicle);
}

export default async function Home() {
  const [
    featuredCars, featuredBikes,
    popularCars, popularBikes,
    upcomingCars, upcomingBikes,
  ] = await Promise.all([
    getVehicles({ vehicleType: "car",  featured: true }),
    getVehicles({ vehicleType: "bike", featured: true }),
    getVehicles({ vehicleType: "car",  category: "popular" }),
    getVehicles({ vehicleType: "bike", category: "popular" }),
    getVehicles({ vehicleType: "car",  category: "upcoming" }),
    getVehicles({ vehicleType: "bike", category: "upcoming" }),
  ]);

  return (
    <>
      <EVHomepage />

      <div className="bg-white py-2">
        <div className="mx-auto max-w-7xl px-4">
          <AdBannerHorizontal slot="1234567890" />
        </div>
      </div>

      <LatestNewsSection />

      {featuredCars.length > 0 && (
        <VehicleSlider
          title="Featured Electric Cars"
          subtitle="Editor's Top Picks"
          vehicles={featuredCars}
          vehicleType="cars"
        />
      )}

      {featuredBikes.length > 0 && (
        <VehicleSlider
          title="Featured Electric Bikes"
          subtitle="Editor's Top Picks"
          vehicles={featuredBikes}
          vehicleType="bikes"
        />
      )}

      {popularCars.length > 0 && (
        <VehicleSlider
          title="Popular Electric Cars"
          subtitle="Trending EV Cars in India"
          vehicles={popularCars}
          vehicleType="cars"
        />
      )}

      <div className="bg-white py-2">
        <div className="mx-auto max-w-7xl px-4">
          <AdBannerHorizontal slot="0987654321" />
        </div>
      </div>

      {popularBikes.length > 0 && (
        <VehicleSlider
          title="Popular Electric Bikes"
          subtitle="Trending EV Bikes in India"
          vehicles={popularBikes}
          vehicleType="bikes"
        />
      )}

      {upcomingCars.length > 0 && (
        <VehicleSlider
          title="Upcoming Electric Cars"
          subtitle="Launching Soon in India"
          vehicles={upcomingCars}
          vehicleType="cars"
        />
      )}

      {upcomingBikes.length > 0 && (
        <VehicleSlider
          title="Upcoming Electric Bikes"
          subtitle="Launching Soon in India"
          vehicles={upcomingBikes}
          vehicleType="bikes"
        />
      )}
    </>
  );
}
