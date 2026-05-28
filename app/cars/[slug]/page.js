import { notFound } from "next/navigation";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { getCarBySlug, getRelatedCars, electricCars } from "@/data/vehiclesData";
import { SITE_URL } from "@/app/layout";

export async function generateStaticParams() {
  return electricCars.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const car = getCarBySlug(slug);
  if (!car) return { title: "Car Not Found" };

  return {
    title: `${car.name} Price in India ${new Date().getFullYear()} – Range, Specs & Colors`,
    description: `${car.name} price starts at ${car.priceDisplay} ex-showroom. Check range (${car.specs?.range_certified}), motor (${car.specs?.motor}), colors, variants, and full specifications. Get best price in your city.`,
    alternates: { canonical: `${SITE_URL}/cars/${slug}` },
    openGraph: {
      title: `${car.name} – Price, Range & Specs`,
      description: `${car.name} starts at ${car.priceDisplay}. Range: ${car.specs?.range_certified}`,
      images: [{ url: car.image, width: 1200, height: 630 }],
    },
  };
}

export default async function CarDetailPage({ params }) {
  const { slug } = await params;
  const car = getCarBySlug(slug);
  if (!car) notFound();

  const related = getRelatedCars(slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.name,
    brand: { "@type": "Brand", name: car.brand },
    description: `${car.name} electric car. Range: ${car.specs?.range_certified}. Motor: ${car.specs?.motor}.`,
    image: car.image,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: car.priceMin * 100000,
      highPrice: car.priceMax * 100000,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: car.rating,
      reviewCount: car.reviewCount,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VehicleDetailPage vehicle={car} relatedVehicles={related} vehicleType="car" />
    </>
  );
}
