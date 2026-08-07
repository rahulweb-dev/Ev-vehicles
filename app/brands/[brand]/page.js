import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Car, Bike, Newspaper, Globe } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import { SITE_URL } from "@/app/layout";
import { parsePrice } from "@/lib/priceUtils";

export const revalidate = 300;

async function getBrandData(brand) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    const Brand     = (await import("@/lib/models/Brand")).default;
    await dbConnect();

    const decoded = decodeURIComponent(brand).replace(/-/g, " ");
    const brandRegex = new RegExp(decoded, "i");

    const [vehicles, articles, brandProfile] = await Promise.all([
      Vehicle.find({ brand: brandRegex, status: "published" }).sort({ createdAt: -1 }).lean(),
      Article.find({
        status: "published",
        $or: [
          { title: brandRegex },
          { tags:  { $elemMatch: { $regex: decoded, $options: "i" } } },
        ],
      }).sort({ publishedAt: -1 }).limit(9).lean(),
      Brand.findOne({ slug: brand }).lean(),
    ]);

    return { vehicles, articles, brandName: vehicles[0]?.brand || decoded, brandProfile };
  } catch {
    return { vehicles: [], articles: [], brandName: decodeURIComponent(brand).replace(/-/g, " "), brandProfile: null };
  }
}

export async function generateMetadata({ params }) {
  const { brand } = await params;
  const { brandName, brandProfile } = await getBrandData(brand);
  return {
    title: `${brandName} Electric Vehicles – Prices, Specs & News`,
    description: brandProfile?.description || `All ${brandName} electric vehicles with prices, specs, variants and latest news in India.`,
    alternates: { canonical: `${SITE_URL}/brands/${brand}` },
    openGraph: {
      title:  `${brandName} Electric Vehicles – Prices, Specs & News`,
      description: brandProfile?.description || `All ${brandName} electric vehicles with prices, specs, variants and latest news in India.`,
      url: `${SITE_URL}/brands/${brand}`,
      type: "website",
      images: [{
        url: brandProfile?.logo || `${SITE_URL}/api/og?title=${encodeURIComponent(brandName + " Electric Vehicles")}&subtitle=Prices, specs %26 latest news in India&tag=cars&type=page`,
        width: 1200, height: 630,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${brandName} Electric Vehicles – Prices, Specs & News`,
      description: brandProfile?.description || `All ${brandName} electric vehicles with prices, specs and latest news in India.`,
      images: [brandProfile?.logo || `${SITE_URL}/api/og?title=${encodeURIComponent(brandName + " Electric Vehicles")}&subtitle=Prices, specs %26 latest news in India&tag=cars&type=page`],
    },
  };
}

export default async function BrandPage({ params }) {
  const { brand } = await params;
  const { vehicles, articles, brandName, brandProfile } = await getBrandData(brand);

  if (!vehicles.length && !articles.length) notFound();

  const cars  = vehicles.filter(v => v.vehicleType === "car");
  const bikes = vehicles.filter(v => v.vehicleType === "bike");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "EV Brands",  item: `${SITE_URL}/brands` },
      { "@type": "ListItem", position: 3, name: brandName,    item: `${SITE_URL}/brands/${brand}` },
    ],
  };

  const brandOrgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName,
    url: `${SITE_URL}/brands/${brand}`,
    description: `${brandName} electric vehicles — prices, specs, and latest news in India.`,
    ...(brandProfile?.logo && { logo: { "@type": "ImageObject", url: brandProfile.logo } }),
  };

  const vehicleItemListJsonLd = vehicles.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${brandName} Electric Vehicles in India`,
    description: `All ${brandName} electric cars, bikes, and scooters available in India with prices and specifications.`,
    url: `${SITE_URL}/brands/${brand}`,
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: v.name,
      url: `${SITE_URL}/${v.vehicleType === "car" ? "cars" : v.vehicleType === "bike" ? "bikes" : "commercial"}/${v.slug}`,
      ...(v.variants?.[0]?.exShowroomPrice && {
        item: {
          "@type": v.vehicleType === "car" ? "Car" : "Motorcycle",
          name: v.name,
          brand: { "@type": "Brand", name: v.brand },
          ...(() => {
            const p = parsePrice(v.variants[0].exShowroomPrice);
            return p != null ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price: p,
                availability: v.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
              },
            } : {};
          })(),
        },
      }),
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandOrgJsonLd) }} />
      {vehicleItemListJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleItemListJsonLd) }} />}
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-green-600">{brandName}</span>
        </nav>

        {/* Brand header */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-20 bg-linear-to-r from-gray-900 to-gray-700" />
          <div className="px-6 pb-6 -mt-10 flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Logo */}
            <div className="shrink-0 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
              {brandProfile?.logo ? (
                <Image src={brandProfile.logo} alt={brandName} width={72} height={72} className="object-contain p-1" />
              ) : (
                <span className="text-4xl font-black text-gray-200">{brandName.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 pt-4 sm:pt-0">
              <h1 className="text-2xl font-black text-gray-900">{brandName} Electric Vehicles</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>{vehicles.length} EV{vehicles.length !== 1 ? "s" : ""}</span>
                <span>·</span>
                <span>{articles.length} News article{articles.length !== 1 ? "s" : ""}</span>
                {brandProfile?.website && (
                  <a href={brandProfile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-600 hover:underline">
                    <Globe size={12} /> Official Site
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                {brandProfile?.description ||
                  `${brandName} is an electric vehicle brand available in India with ${vehicles.length > 0 ? `${vehicles.length} EV model${vehicles.length !== 1 ? "s" : ""}` : "electric vehicles"} across cars and two-wheelers. Browse all ${brandName} EVs with ex-showroom prices, ARAI-certified range, variants, colours, and the latest ${brandName} news below.`}
              </p>
              <div className="mt-3 flex gap-2">
                {cars.length  > 0 && <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><Car  size={12} />{cars.length} Car{cars.length !== 1 ? "s" : ""}</span>}
                {bikes.length > 0 && <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"><Bike size={12} />{bikes.length} Bike{bikes.length !== 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Cars */}
        {cars.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
              <Car size={20} className="text-blue-600" /> Electric Cars
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map(v => <VehicleCard key={v._id?.toString()} vehicle={v} type="cars" />)}
            </div>
          </section>
        )}

        {/* Bikes */}
        {bikes.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
              <Bike size={20} className="text-orange-600" /> Electric Bikes &amp; Scooters
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {bikes.map(v => <VehicleCard key={v._id?.toString()} vehicle={v} type="bikes" />)}
            </div>
          </section>
        )}

        {/* News */}
        {articles.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
              <Newspaper size={20} className="text-green-600" /> Latest {brandName} News
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map(a => <NewsCard key={a._id?.toString()} article={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
}

function VehicleCard({ vehicle, type }) {
  const img   = vehicle.featuredImage || vehicle.image || "";
  const price = vehicle.variants?.[0]?.exShowroomPrice || "Price TBA";
  return (
    <Link href={`/${type}/${vehicle.slug}`}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {img ? (
          <Image src={img} alt={vehicle.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="280px" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-200">⚡</div>
        )}
        {vehicle.availability === "upcoming" && (
          <span className="absolute top-3 left-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white">Coming Soon</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-green-600">{vehicle.brand}</p>
        <h3 className="mt-0.5 text-sm font-black text-gray-900 group-hover:text-green-600 transition line-clamp-1">{vehicle.name}</h3>
        <p className="mt-1 text-base font-black text-gray-800">{price}</p>
      </div>
    </Link>
  );
}
