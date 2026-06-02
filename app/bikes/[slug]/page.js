import { notFound } from "next/navigation";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { SITE_URL } from "@/app/layout";

export const dynamic = "force-dynamic";

async function getVehicle(slug) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.findOne({ slug, vehicleType: "bike", status: "published" }).lean();
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
      vehicleType: "bike",
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
  const bike = await getVehicle(slug);
  if (!bike) return { title: "Bike Not Found" };

  const price = bike.variants?.[0]?.exShowroomPrice || "";
  const range = bike.performance?.drivingRange || "";
  const year  = new Date().getFullYear();

  return {
    title:       bike.metaTitle       || `${bike.name} Price in India ${year} – Range, Specs & Colors`,
    description: bike.metaDescription || `${bike.name} electric scooter/bike${price ? ` price starts at ${price} ex-showroom` : ""}${range ? `. Range: ${range}` : ""}. Full specs, colors, and variants.`,
    keywords:    bike.keywords?.join(", "),
    alternates:  { canonical: bike.canonicalUrl || `${SITE_URL}/bikes/${slug}` },
    openGraph: {
      title:       bike.ogTitle       || bike.metaTitle       || `${bike.name} – Price, Range & Specs`,
      description: bike.ogDescription || bike.metaDescription || `${bike.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      images:      [{ url: bike.ogImage || bike.featuredImage || "", width: 1200, height: 630 }],
    },
  };
}

export default async function BikeDetailPage({ params }) {
  const { slug } = await params;
  const bike = await getVehicle(slug);
  if (!bike) notFound();

  const related = await getRelated(slug, bike.brand);

  const firstVariant = bike.variants?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:   bike.name,
    brand:  { "@type": "Brand", name: bike.brand },
    description: bike.shortDescription || bike.metaDescription || `${bike.name} electric scooter/bike`,
    image:  bike.featuredImage || "",
    ...(firstVariant && {
      offers: {
        "@type":       "Offer",
        priceCurrency: "INR",
        price:         (firstVariant.exShowroomPrice || "").replace(/[^0-9]/g, "") || "0",
        availability:  bike.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VehicleDetailPage vehicle={bike} relatedVehicles={related} vehicleType="bike" />
    </>
  );
}
