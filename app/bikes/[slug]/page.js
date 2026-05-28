import { notFound } from "next/navigation";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { getBikeBySlug, getRelatedBikes, electricBikes } from "@/data/vehiclesData";
import { SITE_URL } from "@/app/layout";

export async function generateStaticParams() {
  return electricBikes.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bike = getBikeBySlug(slug);
  if (!bike) return { title: "Bike Not Found" };

  return {
    title: `${bike.name} Price in India ${new Date().getFullYear()} – Range, Specs & Colors`,
    description: `${bike.name} price starts at ${bike.priceDisplay} ex-showroom. Range: ${bike.specs?.range_certified}, Motor: ${bike.specs?.motor}. Full specifications, colors, and variants. Get best price near you.`,
    alternates: { canonical: `${SITE_URL}/bikes/${slug}` },
    openGraph: {
      title: `${bike.name} – Price, Range & Specs`,
      description: `${bike.name} starts at ${bike.priceDisplay}. Range: ${bike.specs?.range_certified}`,
      images: [{ url: bike.image, width: 1200, height: 630 }],
    },
  };
}

export default async function BikeDetailPage({ params }) {
  const { slug } = await params;
  const bike = getBikeBySlug(slug);
  if (!bike) notFound();

  const related = getRelatedBikes(slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bike.name,
    brand: { "@type": "Brand", name: bike.brand },
    description: `${bike.name} electric scooter/bike. Range: ${bike.specs?.range_certified}. Motor: ${bike.specs?.motor}.`,
    image: bike.image,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: bike.priceMin * 100000,
      highPrice: bike.priceMax * 100000,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: bike.rating,
      reviewCount: bike.reviewCount,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VehicleDetailPage vehicle={bike} relatedVehicles={related} vehicleType="bike" />
    </>
  );
}
