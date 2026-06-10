import { notFound } from "next/navigation";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { SITE_URL } from "@/app/layout";

export const revalidate = 3600;

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

async function getRelated(slug, brand) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.find({
      slug: { $ne: slug },
      vehicleType: "car",
      status: "published",
      $or: [{ brand }, { category: "popular" }],
    })
      .sort({ featured: -1, createdAt: -1 })
      .limit(3)
      .lean();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const car = await getVehicle(slug);
  if (!car) return { title: "Car Not Found" };

  const price = car.variants?.[0]?.exShowroomPrice || "";
  const range = car.performance?.drivingRange || "";
  const year  = new Date().getFullYear();

  return {
    title:       car.metaTitle       || `${car.name} Price in India ${year} – Range, Specs & Colors`,
    description: car.metaDescription || `${car.name} electric car${price ? ` price starts at ${price} ex-showroom` : ""}${range ? `. ARAI range: ${range}` : ""}. Full specs, colors, and variants.`,
    keywords:    car.keywords?.join(", "),
    alternates:  { canonical: car.canonicalUrl || `${SITE_URL}/cars/${slug}` },
    openGraph: {
      title:       car.ogTitle       || car.metaTitle       || `${car.name} – Price, Range & Specs`,
      description: car.ogDescription || car.metaDescription || `${car.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      images:      [{ url: car.ogImage || car.featuredImage || "", width: 1200, height: 630 }],
    },
  };
}

export default async function CarDetailPage({ params }) {
  const { slug } = await params;
  const car = await getVehicle(slug);
  if (!car) notFound();

  const related = await getRelated(slug, car.brand);

  const firstVariant = car.variants?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:   car.name,
    brand:  { "@type": "Brand", name: car.brand },
    description: car.shortDescription || car.metaDescription || `${car.name} electric car`,
    image:  car.featuredImage || "",
    url: `${SITE_URL}/cars/${slug}`,
    ...(firstVariant && {
      offers: {
        "@type":       "Offer",
        priceCurrency: "INR",
        price:         (firstVariant.exShowroomPrice || "").replace(/[^0-9]/g, "") || "0",
        availability:  car.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        url: `${SITE_URL}/cars/${slug}`,
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",         item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Cars", item: `${SITE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: car.name,       item: `${SITE_URL}/cars/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <VehicleDetailPage vehicle={car} relatedVehicles={related} vehicleType="car" />
    </>
  );
}
