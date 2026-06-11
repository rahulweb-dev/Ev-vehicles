import { notFound } from "next/navigation";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { SITE_URL } from "@/app/layout";

export const revalidate = 3600;

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
    url: `${SITE_URL}/bikes/${slug}`,
    ...(firstVariant && {
      offers: {
        "@type":       "Offer",
        priceCurrency: "INR",
        price:         (firstVariant.exShowroomPrice || "").replace(/[^0-9]/g, "") || "0",
        availability:  bike.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        url: `${SITE_URL}/bikes/${slug}`,
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",                    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Bikes & Scooters", item: `${SITE_URL}/bikes` },
      { "@type": "ListItem", position: 3, name: bike.name,                 item: `${SITE_URL}/bikes/${slug}` },
    ],
  };

  const price = firstVariant?.exShowroomPrice;
  const range = bike.performance?.drivingRange;
  const charging = bike.charging?.fastChargingTime;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the price of ${bike.name} in India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: price
            ? `The ${bike.name} price starts at ${price} (ex-showroom). Price may vary by city and variant.`
            : `The official price for ${bike.name} in India has not been announced yet.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the range of ${bike.name} on a single charge?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: range
            ? `The ${bike.name} offers a certified range of ${range} on a full charge under standard test conditions.`
            : `Official range figures for the ${bike.name} have not been confirmed yet.`,
        },
      },
      {
        "@type": "Question",
        name: `How long does it take to charge the ${bike.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: charging
            ? `The ${bike.name} supports fast charging and can be charged to 80% in approximately ${charging}.`
            : `The ${bike.name} supports standard home charging. Refer to the official specifications for exact charging times.`,
        },
      },
      {
        "@type": "Question",
        name: `Is the ${bike.name} available in India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: bike.availability === "available"
            ? `Yes, the ${bike.name} is currently available at authorised dealerships across India.`
            : `The ${bike.name} is expected to launch soon in India. You can register your interest at the official brand website.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <VehicleDetailPage vehicle={bike} relatedVehicles={related} vehicleType="bike" />
    </>
  );
}
