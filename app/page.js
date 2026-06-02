import EVHomepage from "@/components/home/HeroSection";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import VehicleSlider from "@/components/home/VehicleSlider";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { bikeData, carData, upcomingCarData, upcomingBikeData } from "@/data/data";
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
    range:       v.performance?.drivingRange || "—",
    motor:       v.performance?.power       || "—",
    colors:      [],   // DB stores color names, not hex; skip swatches
    rating:      0,
    reviewCount: 0,
    tag:         v.featured ? "Featured" : v.category === "upcoming" ? "Coming Soon" : "Popular",
  };
}

/* ── Fetch a section from MongoDB, fall back to staticFallback ───── */
async function getVehicles(category, vehicleType, staticFallback) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const docs = await Vehicle.find({ category, vehicleType, status: "published" })
      .sort({ featured: -1, createdAt: -1 })
      .limit(12)
      .lean();
    // If admin hasn't added any yet, fall through to static data
    if (docs.length === 0) return staticFallback;
    return docs.map(mapVehicle);
  } catch {
    return staticFallback;
  }
}

export default async function Home() {
  const [popularCars, popularBikes, upcomingCars, upcomingBikes] = await Promise.all([
    getVehicles("popular",  "car",  carData),
    getVehicles("popular",  "bike", bikeData),
    getVehicles("upcoming", "car",  upcomingCarData),
    getVehicles("upcoming", "bike", upcomingBikeData),
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

      <VehicleSlider
        title="Popular Electric Cars"
        subtitle="Trending EV Cars in India"
        vehicles={popularCars}
        vehicleType="cars"
      />

      <div className="bg-white py-2">
        <div className="mx-auto max-w-7xl px-4">
          <AdBannerHorizontal slot="0987654321" />
        </div>
      </div>

      <VehicleSlider
        title="Popular Electric Bikes"
        subtitle="Trending EV Bikes in India"
        vehicles={popularBikes}
        vehicleType="bikes"
      />

      <VehicleSlider
        title="Upcoming Electric Cars"
        subtitle="Launching Soon in India"
        vehicles={upcomingCars}
        vehicleType="cars"
      />

      <VehicleSlider
        title="Upcoming Electric Bikes"
        subtitle="Launching Soon in India"
        vehicles={upcomingBikes}
        vehicleType="bikes"
      />
    </>
  );
}
