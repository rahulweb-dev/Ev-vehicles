import { notFound } from "next/navigation";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { SITE_URL } from "@/app/layout";

export const revalidate = 3600;

async function getVehicle(slug) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.findOne({ slug, vehicleType: "commercial", status: "published" }).lean();
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
      vehicleType: "commercial",
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
  const vehicle = await getVehicle(slug);
  if (!vehicle) return { title: "Vehicle Not Found" };

  const price = vehicle.variants?.[0]?.exShowroomPrice || "";
  const range = vehicle.performance?.drivingRange || "";
  const year  = new Date().getFullYear();

  return {
    title:       vehicle.metaTitle       || `${vehicle.name} Price in India ${year} – Range, Specs & Features`,
    description: vehicle.metaDescription || `${vehicle.name} electric commercial vehicle${price ? ` price starts at ${price} ex-showroom` : ""}${range ? `. Range: ${range}` : ""}. Full specs and variants.`,
    keywords:    vehicle.keywords?.join(", "),
    alternates:  { canonical: vehicle.canonicalUrl || `${SITE_URL}/commercial/${slug}` },
    openGraph: {
      title:       vehicle.ogTitle       || vehicle.metaTitle       || `${vehicle.name} – Price & Specs`,
      description: vehicle.ogDescription || vehicle.metaDescription || `${vehicle.name}${price ? ` starts at ${price}` : ""}`,
      images:      [{ url: vehicle.ogImage || vehicle.featuredImage || "", width: 1200, height: 630 }],
    },
  };
}

async function getReviewStats(slug) {
  try {
    const dbConnect     = (await import("@/lib/mongodb")).default;
    const VehicleReview = (await import("@/lib/models/VehicleReview")).default;
    await dbConnect();
    const stats = await VehicleReview.aggregate([
      { $match: { vehicleSlug: slug, status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    return stats[0] || null;
  } catch { return null; }
}

export default async function CommercialDetailPage({ params }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  const [related, reviewStats] = await Promise.all([
    getRelated(slug, vehicle.brand),
    getReviewStats(slug),
  ]);

  const firstVariant = vehicle.variants?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:   vehicle.name,
    brand:  { "@type": "Brand", name: vehicle.brand },
    description: vehicle.shortDescription || vehicle.metaDescription || `${vehicle.name} electric commercial vehicle`,
    image:  vehicle.featuredImage || "",
    url: `${SITE_URL}/commercial/${slug}`,
    ...(firstVariant && {
      offers: {
        "@type":       "Offer",
        priceCurrency: "INR",
        price:         (firstVariant.exShowroomPrice || "").replace(/[^0-9]/g, "") || "0",
        availability:  vehicle.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        url: `${SITE_URL}/commercial/${slug}`,
      },
    }),
    ...(reviewStats?.count > 0 && {
      aggregateRating: {
        "@type":       "AggregateRating",
        ratingValue:   reviewStats.avg.toFixed(1),
        reviewCount:   reviewStats.count,
        bestRating:    "5",
        worstRating:   "1",
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",             item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Commercial EVs",   item: `${SITE_URL}/commercial` },
      { "@type": "ListItem", position: 3, name: vehicle.name,       item: `${SITE_URL}/commercial/${slug}` },
    ],
  };

  const price    = firstVariant?.exShowroomPrice;
  const range    = vehicle.performance?.drivingRange;
  const charging = vehicle.charging?.dcChargingTime;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the price of ${vehicle.name} in India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: price
            ? `The ${vehicle.name} price starts at ${price} (ex-showroom). Price may vary by city and variant.`
            : `The official price for ${vehicle.name} in India has not been announced yet.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the range of ${vehicle.name} on a single charge?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: range
            ? `The ${vehicle.name} offers a certified range of ${range} on a full charge.`
            : `Official range figures for the ${vehicle.name} have not been confirmed yet.`,
        },
      },
      {
        "@type": "Question",
        name: `How long does it take to charge the ${vehicle.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: charging
            ? `The ${vehicle.name} supports fast charging and can charge to 80% in approximately ${charging}.`
            : `The ${vehicle.name} supports standard AC charging. Refer to the official specifications for exact charging times.`,
        },
      },
      {
        "@type": "Question",
        name: `Is the ${vehicle.name} available in India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: vehicle.availability === "available"
            ? `Yes, the ${vehicle.name} is currently available in India.`
            : `The ${vehicle.name} is expected to launch soon in India.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <VehicleDetailPage vehicle={vehicle} relatedVehicles={related} vehicleType="commercial" />
    </>
  );
}
