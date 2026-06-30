import { notFound } from "next/navigation";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { SITE_URL } from "@/app/layout";

export const revalidate = 3600;

function parsePriceToINR(str) {
  if (!str) return "0";
  const cleaned = String(str).replace(/[₹,\s]/g, "").toLowerCase();
  const m = cleaned.match(/([\d.]+)\s*(lakh|l|cr|crore)?/);
  if (!m) return "0";
  const num = parseFloat(m[1]);
  const unit = m[2] || "";
  if (unit.startsWith("cr")) return String(Math.round(num * 10000000));
  if (unit === "lakh" || unit === "l") return String(Math.round(num * 100000));
  return String(Math.round(num));
}

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
      url: car.canonicalUrl || `${SITE_URL}/cars/${slug}`,
      type: "website",
      images: [{
        url: car.ogImage || car.featuredImage ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(car.name)}&subtitle=${encodeURIComponent(`${price ? price + " onwards" : ""}${range ? " · Range " + range : ""}`)}&type=vehicle&tag=cars${car.featuredImage ? "&image=" + encodeURIComponent(car.featuredImage) : ""}`,
        width: 1200, height: 630,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: car.ogTitle || car.metaTitle || `${car.name} – Price, Range & Specs`,
      description: car.ogDescription || car.metaDescription || `${car.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      images: [car.ogImage || car.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(car.name)}&subtitle=${encodeURIComponent(`${price ? price + " onwards" : ""}${range ? " · Range " + range : ""}`)}&type=vehicle&tag=cars${car.featuredImage ? "&image=" + encodeURIComponent(car.featuredImage) : ""}`],
    },
  };
}

async function getReviewStats(slug) {
  try {
    const dbConnect    = (await import("@/lib/mongodb")).default;
    const VehicleReview = (await import("@/lib/models/VehicleReview")).default;
    await dbConnect();
    const stats = await VehicleReview.aggregate([
      { $match: { vehicleSlug: slug, status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    return stats[0] || null;
  } catch { return null; }
}

export default async function CarDetailPage({ params }) {
  const { slug } = await params;
  const car = await getVehicle(slug);
  if (!car) notFound();

  const [related, reviewStats] = await Promise.all([
    getRelated(slug, car.brand),
    getReviewStats(slug),
  ]);

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
        price:         parsePriceToINR(firstVariant.exShowroomPrice),
        availability:  car.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        url: `${SITE_URL}/cars/${slug}`,
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
      { "@type": "ListItem", position: 1, name: "Home",         item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Cars", item: `${SITE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: car.name,       item: `${SITE_URL}/cars/${slug}` },
    ],
  };

  const price = firstVariant?.exShowroomPrice;
  const range = car.performance?.drivingRange;
  const charging = car.charging?.fastChargingTime;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the price of ${car.name} in India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: price
            ? `The ${car.name} price starts at ${price} (ex-showroom). Price may vary by city and variant.`
            : `The official price for ${car.name} in India has not been announced yet.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the range of ${car.name} on a single charge?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: range
            ? `The ${car.name} offers a certified range of ${range} on a full charge under standard test conditions.`
            : `Official range figures for the ${car.name} have not been confirmed yet.`,
        },
      },
      {
        "@type": "Question",
        name: `How long does it take to charge the ${car.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: charging
            ? `The ${car.name} supports DC fast charging and can charge to 80% in approximately ${charging}. Home AC charging times vary by charger capacity.`
            : `The ${car.name} supports home AC charging and DC fast charging. Refer to the official specifications for exact charging times.`,
        },
      },
      {
        "@type": "Question",
        name: `Is the ${car.name} available in India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: car.availability === "available"
            ? `Yes, the ${car.name} is currently available at authorised dealerships across India.`
            : `The ${car.name} is expected to launch soon in India. You can register your interest at the official brand website.`,
        },
      },
    ],
  };

  const videoId = car.videoUrl?.match(/(?:youtu\.be\/|[?&]v=)([^?&]{11})/)?.[1];
  const videoJsonLd = videoId ? {
    "@context":    "https://schema.org",
    "@type":       "VideoObject",
    name:          `${car.name} Review & First Look`,
    description:   `Watch the full ${car.name} review including range test, features, and performance.`,
    thumbnailUrl:  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    uploadDate:    car.createdAt ? new Date(car.createdAt).toISOString() : new Date().toISOString(),
    contentUrl:    `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl:      `https://www.youtube.com/embed/${videoId}`,
    publisher:     { "@type": "Organization", name: "EV News India", url: SITE_URL },
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {videoJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />}
      <VehicleDetailPage vehicle={car} relatedVehicles={related} vehicleType="car" />
    </>
  );
}
