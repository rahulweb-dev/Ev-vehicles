import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
    keywords:    car.keywords?.join(", ") || `${car.name} price india, ${car.name} on road price, ${car.name} range, ${car.name} specs, ${car.brand} electric car india, ${car.name} review`,
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
        alt: `${car.name} – Price, Range & Specs`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: car.ogTitle || car.metaTitle || `${car.name} – Price, Range & Specs`,
      description: car.ogDescription || car.metaDescription || `${car.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      images: [{ url: car.ogImage || car.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(car.name)}&subtitle=${encodeURIComponent(`${price ? price + " onwards" : ""}${range ? " · Range " + range : ""}`)}&type=vehicle&tag=cars${car.featuredImage ? "&image=" + encodeURIComponent(car.featuredImage) : ""}`, alt: `${car.name} – Price, Range & Specs` }],
    },
  };
}

async function getRelatedNews(name, brand) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    return await Article.find({
      status: "published",
      $or: [
        { title: { $regex: brand, $options: "i" } },
        { tags:  { $in: [brand, name] } },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(4)
      .select("slug title image excerpt publishedAt readTime")
      .lean();
  } catch {
    return [];
  }
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

  const [related, reviewStats, relatedNews] = await Promise.all([
    getRelated(slug, car.brand),
    getReviewStats(slug),
    getRelatedNews(car.name, car.brand),
  ]);

  const firstVariant = car.variants?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name:   car.name,
    brand:  { "@type": "Brand", name: car.brand },
    description: car.shortDescription || car.metaDescription || `${car.name} electric car`,
    image:  car.featuredImage || "",
    url: `${SITE_URL}/cars/${slug}`,
    inLanguage: "en-IN",
    fuelType: "Electric",
    vehicleTransmission: "Automatic",
    driveWheelConfiguration: car.performance?.driveType || "FrontWheelDriveConfiguration",
    ...(car.specs?.seatingCapacity && { vehicleSeatingCapacity: parseInt(car.specs.seatingCapacity) || undefined }),
    ...(car.performance?.power && {
      vehicleEngine: {
        "@type": "EngineSpecification",
        engineType: "Electric Motor",
        enginePower: { "@type": "QuantitativeValue", value: car.performance.power, unitText: "kW" },
        torque: car.performance?.torque ? { "@type": "QuantitativeValue", value: car.performance.torque, unitText: "Nm" } : undefined,
      },
    }),
    ...(firstVariant && {
      offers: {
        "@type":       "Offer",
        priceCurrency: "INR",
        price:         parsePriceToINR(firstVariant.exShowroomPrice),
        priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
        availability:  car.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        url: `${SITE_URL}/cars/${slug}`,
        seller: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "India" },
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
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
    additionalProperty: [
      ...(car.performance?.drivingRange ? [{ "@type": "PropertyValue", name: "ARAI Range", value: car.performance.drivingRange, unitText: "km" }] : []),
      ...(car.performance?.batteryCapacity ? [{ "@type": "PropertyValue", name: "Battery Capacity", value: car.performance.batteryCapacity, unitText: "kWh" }] : []),
      ...(car.performance?.power ? [{ "@type": "PropertyValue", name: "Motor Power", value: car.performance.power }] : []),
      ...(car.performance?.topSpeed ? [{ "@type": "PropertyValue", name: "Top Speed", value: car.performance.topSpeed, unitText: "km/h" }] : []),
      ...(car.charging?.dcChargingTime ? [{ "@type": "PropertyValue", name: "DC Fast Charge Time (10–80%)", value: car.charging.dcChargingTime }] : []),
      ...(car.specs?.bootSpace ? [{ "@type": "PropertyValue", name: "Boot Space", value: car.specs.bootSpace, unitText: "litres" }] : []),
    ],
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

      {/* Speakable summary — voice search / AEO: indexed by Google, read by assistants */}
      <p className="sr-only" data-speakable aria-label={`${car.name} key facts`}>
        {`${car.name} is an electric car by ${car.brand}.`}
        {firstVariant?.exShowroomPrice ? ` Price starts at ${firstVariant.exShowroomPrice} ex-showroom.` : ""}
        {range ? ` ARAI certified range: ${range}.` : ""}
        {car.performance?.power ? ` Motor power: ${car.performance.power}.` : ""}
        {car.performance?.batteryCapacity ? ` Battery: ${car.performance.batteryCapacity}.` : ""}
        {car.charging?.dcChargingTime ? ` DC fast charge time: ${car.charging.dcChargingTime}.` : ""}
        {car.availability === "available" ? " Currently available at authorised dealerships across India." : " Expected to launch in India soon."}
      </p>

      <VehicleDetailPage vehicle={car} relatedVehicles={related} vehicleType="car" />

      {/* City on-road price links — server-rendered for SEO */}
      <section className="border-t border-gray-100 bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-4 text-xl font-black text-gray-900">{car.name} On-Road Price by City</h2>
          <p className="mb-5 text-sm text-gray-500">Check the exact on-road price of {car.name} in your city, including RTO, insurance, and state taxes.</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { slug: "mumbai",     name: "Mumbai" },
              { slug: "delhi",      name: "Delhi" },
              { slug: "bangalore",  name: "Bangalore" },
              { slug: "chennai",    name: "Chennai" },
              { slug: "hyderabad",  name: "Hyderabad" },
              { slug: "pune",       name: "Pune" },
              { slug: "ahmedabad",  name: "Ahmedabad" },
              { slug: "kolkata",    name: "Kolkata" },
              { slug: "jaipur",     name: "Jaipur" },
              { slug: "lucknow",    name: "Lucknow" },
              { slug: "chandigarh", name: "Chandigarh" },
              { slug: "bhopal",     name: "Bhopal" },
            ].map((city) => (
              <Link key={city.slug}
                href={`/cars/${car.slug}/price-in-${city.slug}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-400 hover:text-green-700 transition">
                {car.name} Price in {city.name}
                <ChevronRight size={14} className="text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {relatedNews.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-6 text-2xl font-black text-gray-900">
              Latest {car.brand} News & Updates
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedNews.map((article) => (
                <Link key={article.slug} href={`/news/${article.slug}`} className="group block">
                  <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                    {article.image && (
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-green-600 transition">
                        {article.title}
                      </h3>
                      {article.readTime && (
                        <p className="mt-2 text-xs text-gray-400">{article.readTime} read</p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href={`/news?q=${encodeURIComponent(car.brand)}`}
                className="inline-flex items-center gap-2 rounded-full border border-green-600 px-6 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
              >
                View All {car.brand} News →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
