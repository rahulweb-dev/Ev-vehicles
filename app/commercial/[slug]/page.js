import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import VehicleDetailPage from "@/components/vehicles/VehicleDetailPage";
import { SITE_URL } from "@/app/layout";
import { parsePrice } from "@/lib/priceUtils";

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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) return { title: "Vehicle Not Found" };

  const price = vehicle.variants?.[0]?.exShowroomPrice || "";
  const range = vehicle.performance?.drivingRange || "";
  const year  = new Date().getFullYear();

  const payload  = vehicle.specs?.payloadCapacity || "";
  const battery  = vehicle.performance?.batteryCapacity || "";

  const titleSuffix = [price && price, range && `${range} Range`].filter(Boolean).join(" | ");
  const defaultTitle = `${vehicle.name} Price in India${titleSuffix ? ` – ${titleSuffix}` : ""} | ${year} Specs`;

  const defaultDesc = [
    `${vehicle.name} electric commercial vehicle price starts at ${price || "TBA"} ex-showroom.`,
    range   && `Range: ${range}.`,
    payload && `Payload: ${payload}.`,
    battery && `Battery: ${battery}.`,
    `Full specs, variants & on-road price.`,
  ].filter(Boolean).join(" ");

  return {
    title:       vehicle.metaTitle       || defaultTitle,
    description: vehicle.metaDescription || defaultDesc,
    keywords:    vehicle.keywords?.join(", "),
    alternates:  { canonical: vehicle.canonicalUrl || `${SITE_URL}/commercial/${slug}` },
    openGraph: {
      title:       vehicle.ogTitle       || vehicle.metaTitle       || `${vehicle.name} – Price & Specs`,
      description: vehicle.ogDescription || vehicle.metaDescription || `${vehicle.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      url: vehicle.canonicalUrl || `${SITE_URL}/commercial/${slug}`,
      type: "website",
      images: [{
        url: vehicle.ogImage || vehicle.featuredImage ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(vehicle.name)}&subtitle=${encodeURIComponent(`${price ? price + " onwards" : ""}${range ? " · Range " + range : ""}`)}&type=vehicle&tag=commercial${vehicle.featuredImage ? "&image=" + encodeURIComponent(vehicle.featuredImage) : ""}`,
        width: 1200, height: 630,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: vehicle.ogTitle || vehicle.metaTitle || `${vehicle.name} – Price & Specs`,
      description: vehicle.ogDescription || vehicle.metaDescription || `${vehicle.name}${price ? ` starts at ${price}` : ""}${range ? `. Range: ${range}` : ""}.`,
      images: [vehicle.ogImage || vehicle.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(vehicle.name)}&subtitle=${encodeURIComponent(`${price ? price + " onwards" : ""}${range ? " · Range " + range : ""}`)}&type=vehicle&tag=commercial${vehicle.featuredImage ? "&image=" + encodeURIComponent(vehicle.featuredImage) : ""}`],
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

  const [related, reviewStats, relatedNews] = await Promise.all([
    getRelated(slug, vehicle.brand),
    getReviewStats(slug),
    getRelatedNews(vehicle.name, vehicle.brand),
  ]);

  const firstVariant = vehicle.variants?.[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name:   vehicle.name,
    brand:  { "@type": "Brand", name: vehicle.brand },
    description: vehicle.shortDescription || vehicle.metaDescription || `${vehicle.name} electric commercial vehicle`,
    image:  vehicle.featuredImage || "",
    url: `${SITE_URL}/commercial/${slug}`,
    inLanguage: "en-IN",
    fuelType: "Electric",
    vehicleTransmission: "Automatic",
    ...(vehicle.performance?.power && {
      vehicleEngine: {
        "@type": "EngineSpecification",
        engineType: "Electric Motor",
        enginePower: { "@type": "QuantitativeValue", value: vehicle.performance.power, unitText: "kW" },
        ...(vehicle.performance?.torque && { torque: { "@type": "QuantitativeValue", value: vehicle.performance.torque, unitText: "Nm" } }),
      },
    }),
    ...(firstVariant && {
      offers: {
        "@type":       "Offer",
        priceCurrency: "INR",
        price:         parsePrice(firstVariant.exShowroomPrice),
        priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
        availability:  vehicle.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        url: `${SITE_URL}/commercial/${slug}`,
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
      ...(vehicle.performance?.drivingRange ? [{ "@type": "PropertyValue", name: "Range", value: vehicle.performance.drivingRange, unitText: "km" }] : []),
      ...(vehicle.performance?.batteryCapacity ? [{ "@type": "PropertyValue", name: "Battery Capacity", value: vehicle.performance.batteryCapacity, unitText: "kWh" }] : []),
      ...(vehicle.performance?.power ? [{ "@type": "PropertyValue", name: "Motor Power", value: vehicle.performance.power }] : []),
      ...(vehicle.performance?.topSpeed ? [{ "@type": "PropertyValue", name: "Top Speed", value: vehicle.performance.topSpeed, unitText: "km/h" }] : []),
      ...(vehicle.charging?.dcChargingTime ? [{ "@type": "PropertyValue", name: "DC Fast Charge Time (10–80%)", value: vehicle.charging.dcChargingTime }] : []),
      ...(vehicle.specs?.payloadCapacity ? [{ "@type": "PropertyValue", name: "Payload Capacity", value: vehicle.specs.payloadCapacity, unitText: "kg" }] : []),
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",           item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Commercial EVs", item: `${SITE_URL}/commercial` },
      { "@type": "ListItem", position: 3, name: vehicle.name,     item: `${SITE_URL}/commercial/${slug}` },
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
            ? `The ${vehicle.name} supports DC fast charging and can charge to 80% in approximately ${charging}.`
            : `The ${vehicle.name} supports standard AC charging. Refer to official specifications for exact charging times.`,
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

  const videoId = vehicle.videoUrl?.match(/(?:youtu\.be\/|[?&]v=)([^?&]{11})/)?.[1];
  const videoJsonLd = videoId ? {
    "@context":    "https://schema.org",
    "@type":       "VideoObject",
    name:          `${vehicle.name} Review & First Look`,
    description:   `Watch the full ${vehicle.name} review including range test, features, and performance.`,
    thumbnailUrl:  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    uploadDate:    vehicle.createdAt ? new Date(vehicle.createdAt).toISOString() : new Date().toISOString(),
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
      <p className="sr-only" data-speakable aria-label={`${vehicle.name} key facts`}>
        {`${vehicle.name} is an electric commercial vehicle by ${vehicle.brand}.`}
        {firstVariant?.exShowroomPrice ? ` Price starts at ${firstVariant.exShowroomPrice} ex-showroom.` : ""}
        {range ? ` Certified range: ${range}.` : ""}
        {vehicle.performance?.power ? ` Motor power: ${vehicle.performance.power}.` : ""}
        {vehicle.performance?.batteryCapacity ? ` Battery: ${vehicle.performance.batteryCapacity}.` : ""}
        {vehicle.availability === "available" ? " Currently available in India." : " Expected to launch in India soon."}
      </p>

      <VehicleDetailPage vehicle={vehicle} relatedVehicles={related} vehicleType="commercial" />

      {relatedNews.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-6 text-2xl font-black text-gray-900">
              Latest {vehicle.brand} News & Updates
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
                href={`/news?q=${encodeURIComponent(vehicle.brand)}`}
                className="inline-flex items-center gap-2 rounded-full border border-green-600 px-6 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
              >
                View All {vehicle.brand} News →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
