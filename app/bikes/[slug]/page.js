import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

  const price    = bike.variants?.[0]?.exShowroomPrice || "";
  const range    = bike.performance?.drivingRange || "";
  const battery  = bike.performance?.batteryCapacity || "";
  const topSpeed = bike.performance?.topSpeed || "";
  const variants = bike.variants?.length || 0;
  const year     = new Date().getFullYear();

  const titleSuffix = [price && price, range && `${range} Range`].filter(Boolean).join(" | ");
  const defaultTitle = `${bike.name} Price in India${titleSuffix ? ` – ${titleSuffix}` : ""} | ${year} Specs`;

  const defaultDesc = [
    `${bike.name} price starts at ${price || "TBA"} ex-showroom in India.`,
    range    && `Range: ${range}.`,
    battery  && `Battery: ${battery}.`,
    topSpeed && `Top speed: ${topSpeed}.`,
    variants > 1 && `${variants} variants available.`,
    `Check on-road price, EMI, full specs & colours.`,
  ].filter(Boolean).join(" ");

  return {
    title:       bike.metaTitle       || defaultTitle,
    description: bike.metaDescription || defaultDesc,
    keywords:    bike.keywords?.join(", "),
    alternates:  { canonical: bike.canonicalUrl || `${SITE_URL}/bikes/${slug}` },
    openGraph: {
      title:       bike.ogTitle       || bike.metaTitle       || `${bike.name} – Price, Range & Specs`,
      description: bike.ogDescription || bike.metaDescription || `${bike.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      url: bike.canonicalUrl || `${SITE_URL}/bikes/${slug}`,
      type: "website",
      images: [{
        url: bike.ogImage || bike.featuredImage ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(bike.name)}&subtitle=${encodeURIComponent(`${price ? price + " onwards" : ""}${range ? " · Range " + range : ""}`)}&type=vehicle&tag=bikes${bike.featuredImage ? "&image=" + encodeURIComponent(bike.featuredImage) : ""}`,
        width: 1200, height: 630,
        alt: `${bike.name} – Price, Range & Specs`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: bike.ogTitle || bike.metaTitle || `${bike.name} – Price, Range & Specs`,
      description: bike.ogDescription || bike.metaDescription || `${bike.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      images: [{ url: bike.ogImage || bike.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(bike.name)}&subtitle=${encodeURIComponent(`${price ? price + " onwards" : ""}${range ? " · Range " + range : ""}`)}&type=vehicle&tag=bikes${bike.featuredImage ? "&image=" + encodeURIComponent(bike.featuredImage) : ""}`, alt: `${bike.name} – Price, Range & Specs` }],
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

export default async function BikeDetailPage({ params }) {
  const { slug } = await params;
  const bike = await getVehicle(slug);
  if (!bike) notFound();

  const [related, reviewStats, relatedNews] = await Promise.all([
    getRelated(slug, bike.brand),
    getReviewStats(slug),
    getRelatedNews(bike.name, bike.brand),
  ]);

  const firstVariant = bike.variants?.[0];

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Motorcycle",
    name:   bike.name,
    brand:  { "@type": "Brand", name: bike.brand },
    description: bike.shortDescription || bike.metaDescription || `${bike.name} electric scooter/bike`,
    image:  bike.featuredImage || "",
    url: `${SITE_URL}/bikes/${slug}`,
    inLanguage: "en-IN",
    fuelType: "Electric",
    vehicleTransmission: "Automatic",
    ...(bike.performance?.power && {
      vehicleEngine: {
        "@type": "EngineSpecification",
        engineType: "Electric Motor",
        enginePower: { "@type": "QuantitativeValue", value: bike.performance.power, unitText: "kW" },
        ...(bike.performance?.torque && { torque: { "@type": "QuantitativeValue", value: bike.performance.torque, unitText: "Nm" } }),
      },
    }),
    ...(firstVariant && {
      offers: {
        "@type":       "Offer",
        priceCurrency: "INR",
        price:         parsePriceToINR(firstVariant.exShowroomPrice),
        priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
        availability:  bike.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        url: `${SITE_URL}/bikes/${slug}`,
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
      ...(bike.performance?.drivingRange ? [{ "@type": "PropertyValue", name: "ARAI Range", value: bike.performance.drivingRange, unitText: "km" }] : []),
      ...(bike.performance?.batteryCapacity ? [{ "@type": "PropertyValue", name: "Battery Capacity", value: bike.performance.batteryCapacity, unitText: "kWh" }] : []),
      ...(bike.performance?.power ? [{ "@type": "PropertyValue", name: "Motor Power", value: bike.performance.power }] : []),
      ...(bike.performance?.topSpeed ? [{ "@type": "PropertyValue", name: "Top Speed", value: bike.performance.topSpeed, unitText: "km/h" }] : []),
      ...(bike.charging?.fastChargingTime ? [{ "@type": "PropertyValue", name: "Fast Charge Time (10–80%)", value: bike.charging.fastChargingTime }] : []),
    ],
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
      ...(bike.specs?.kerbWeight ? [{
        "@type": "Question",
        name: `What is the kerb weight of ${bike.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `The kerb weight of the ${bike.name} is ${bike.specs.kerbWeight}.` },
      }] : []),
      ...(bike.performance?.topSpeed ? [{
        "@type": "Question",
        name: `What is the top speed of ${bike.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `The ${bike.name} has a top speed of ${bike.performance.topSpeed}.` },
      }] : []),
      ...(bike.performance?.batteryCapacity ? [{
        "@type": "Question",
        name: `What is the battery capacity of ${bike.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `The ${bike.name} is equipped with a ${bike.performance.batteryCapacity} battery pack.` },
      }] : []),
      ...(bike.specs?.groundClearance ? [{
        "@type": "Question",
        name: `What is the ground clearance of ${bike.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `The ${bike.name} has a ground clearance of ${bike.specs.groundClearance}.` },
      }] : []),
    ],
  };

  const videoId = bike.videoUrl?.match(/(?:youtu\.be\/|[?&]v=)([^?&]{11})/)?.[1];
  const videoJsonLd = videoId ? {
    "@context":    "https://schema.org",
    "@type":       "VideoObject",
    name:          `${bike.name} Review & First Look`,
    description:   `Watch the full ${bike.name} review including range test, features, and performance.`,
    thumbnailUrl:  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    uploadDate:    bike.createdAt ? new Date(bike.createdAt).toISOString() : new Date().toISOString(),
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

      {/* Speakable summary — voice search / AEO */}
      <p className="sr-only" data-speakable aria-label={`${bike.name} key facts`}>
        {`${bike.name} is an electric scooter/bike by ${bike.brand}.`}
        {firstVariant?.exShowroomPrice ? ` Price starts at ${firstVariant.exShowroomPrice} ex-showroom.` : ""}
        {range ? ` Certified range: ${range}.` : ""}
        {bike.performance?.power ? ` Motor power: ${bike.performance.power}.` : ""}
        {bike.performance?.batteryCapacity ? ` Battery: ${bike.performance.batteryCapacity}.` : ""}
        {bike.availability === "available" ? " Currently available at authorised dealers across India." : " Expected to launch in India soon."}
      </p>

      <VehicleDetailPage vehicle={bike} relatedVehicles={related} vehicleType="bike" />

      {relatedNews.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-6 text-2xl font-black text-gray-900">
              Latest {bike.brand} News & Updates
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
                href={`/news?q=${encodeURIComponent(bike.brand)}`}
                className="inline-flex items-center gap-2 rounded-full border border-green-600 px-6 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
              >
                View All {bike.brand} News →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
