import EVHomepage from "@/components/home/HeroSection";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import VehicleSlider from "@/components/home/VehicleSlider";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { bikeData, carData, upcomingCarData, upcomingBikeData } from "@/data/data";
import { SITE_URL } from "./layout";

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

export default function Home() {
  return (
    <>
      <EVHomepage />

      <div className="bg-white py-2">
        <div className="mx-auto max-w-7xl px-4">
          <AdBannerHorizontal slot="1234567890" />
        </div>
      </div>

      <LatestNewsSection />

      <VehicleSlider title="Popular Electric Cars" subtitle="Trending EV Cars in India" vehicles={carData} vehicleType="cars" />

      <div className="bg-white py-2">
        <div className="mx-auto max-w-7xl px-4">
          <AdBannerHorizontal slot="0987654321" />
        </div>
      </div>

      <VehicleSlider title="Popular Electric Bikes" subtitle="Trending EV bikes in India" vehicles={bikeData} vehicleType="bikes" />
      <VehicleSlider title="Upcoming Electric Cars" subtitle="Launching Soon in India" vehicles={upcomingCarData} vehicleType="cars" />
      <VehicleSlider title="Upcoming Electric Bikes" subtitle="Launching Soon in India" vehicles={upcomingBikeData} vehicleType="bikes" />
    </>
  );
}
