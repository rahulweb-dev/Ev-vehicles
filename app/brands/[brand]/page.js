import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Car, Bike, Newspaper } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import { SITE_URL } from "@/app/layout";

export const revalidate = 300;

async function getBrandData(brand) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();

    const decoded = decodeURIComponent(brand).replace(/-/g, " ");
    const brandRegex = new RegExp(decoded, "i");

    const [vehicles, articles] = await Promise.all([
      Vehicle.find({ brand: brandRegex, status: "published" }).sort({ createdAt: -1 }).lean(),
      Article.find({
        status: "published",
        $or: [
          { title: brandRegex },
          { tags:  { $elemMatch: { $regex: decoded, $options: "i" } } },
        ],
      }).sort({ publishedAt: -1 }).limit(9).lean(),
    ]);

    return { vehicles, articles, brandName: vehicles[0]?.brand || decoded };
  } catch {
    return { vehicles: [], articles: [], brandName: decodeURIComponent(brand).replace(/-/g, " ") };
  }
}

export async function generateMetadata({ params }) {
  const { brand } = await params;
  const decoded = decodeURIComponent(brand).replace(/-/g, " ");
  return {
    title: `${decoded} Electric Vehicles – Prices, Specs & News`,
    description: `All ${decoded} electric vehicles with prices, specs, variants and latest news in India.`,
    alternates: { canonical: `${SITE_URL}/brands/${brand}` },
  };
}

export default async function BrandPage({ params }) {
  const { brand } = await params;
  const { vehicles, articles, brandName } = await getBrandData(brand);

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
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandOrgJsonLd) }} />
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-green-600">{brandName}</span>
        </nav>

        {/* Brand header */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">{brandName} Electric Vehicles</h1>
          <p className="mt-2 text-gray-500">
            {vehicles.length} EV{vehicles.length !== 1 ? "s" : ""} · {articles.length} News article{articles.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-4 flex gap-3">
            {cars.length  > 0 && <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700"><Car  size={14} />{cars.length} Car{cars.length !== 1 ? "s" : ""}</span>}
            {bikes.length > 0 && <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700"><Bike size={14} />{bikes.length} Bike{bikes.length !== 1 ? "s" : ""}</span>}
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
