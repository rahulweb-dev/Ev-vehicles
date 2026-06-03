import Image from "next/image";
import Link from "next/link";
import { Star, BatteryCharging, Gauge, Zap, ChevronRight } from "lucide-react";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";

export const revalidate = 60;

export const metadata = {
  title: "Electric Cars in India 2026 – Price, Range & Specs | EV News India",
  description:
    "Compare all electric cars in India 2026. Prices from ₹9.99 Lakh. Check range, specs, colors, and latest news for Tata, Mahindra, Hyundai, BYD, Kia EVs.",
  alternates: { canonical: `${SITE_URL}/cars` },
};

/* ── Map DB vehicle doc → card shape ──────────────────────────────── */
function mapDbCar(v) {
  const first = v.variants?.[0];
  const last  = v.variants?.[v.variants.length - 1];
  const priceDisplay =
    first?.exShowroomPrice
      ? first.exShowroomPrice !== last?.exShowroomPrice
        ? `${first.exShowroomPrice} – ${last.exShowroomPrice}`
        : first.exShowroomPrice
      : "Price TBA";
  return {
    slug:         v.slug,
    name:         v.name,
    brand:        v.brand,
    image:        v.featuredImage || "",
    priceDisplay,
    emiMin:       null,
    rating:       0,
    reviewCount:  0,
    tag:          v.featured ? "Featured" : v.category === "upcoming" ? "Coming Soon" : "Popular",
    specs: {
      range_certified: v.performance?.drivingRange || v.variants?.[0]?.range || "—",
      motor:           v.performance?.power        || "—",
      top_speed:       v.performance?.topSpeed     || "—",
    },
    colors: (v.colors || []).map((c) =>
      typeof c === "string" ? { name: c, hex: "#888888" } : { name: c.name, hex: c.hexCode || "#888888" }
    ),
  };
}

/* ── Fetch from DB, fall back to static ───────────────────────────── */
async function getCars() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const docs = await Vehicle.find({ vehicleType: "car", status: "published" })
      .sort({ featured: -1, category: 1, createdAt: -1 })
      .limit(60)
      .lean();
    if (docs.length > 0) return { cars: docs.map(mapDbCar), total: docs.length };
  } catch { /* fall through */ }
  // fallback
  return { cars: electricCars.map((c) => ({ ...c, image: c.image || "" })), total: electricCars.length };
}

/* ══════════════════════════════════════════════════════════════════ */
export default async function CarsPage() {
  const { cars, total } = await getCars();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",          item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Cars", item: `${SITE_URL}/cars` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">Electric Cars</span>
            </nav>
            <h1 className="text-4xl font-black text-white">Electric Cars in India 2026</h1>
            <p className="mt-2 text-green-300">{total} models available · Prices from ₹7.99 Lakh</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          <AdBannerHorizontal slot="7890123456" />

          <section className="mt-8">
            <h2 className="mb-6 text-2xl font-black text-gray-900">All Electric Cars</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => <CarCard key={car.slug} car={car} />)}
            </div>
          </section>

          <div className="my-10"><AdBannerHorizontal slot="7890123457" /></div>

          <section>
            <h2 className="mb-6 text-2xl font-black text-gray-900">Latest Electric Car News</h2>
            <ArticlesFeed category="cars" limit={8} cols="sm:grid-cols-2 lg:grid-cols-4" skeletonCount={4} />
          </section>
        </div>
      </div>
    </>
  );
}

function CarCard({ car }) {
  return (
    <Link href={`/cars/${car.slug}`} className="group block">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-50 overflow-hidden bg-gray-100">
          {car.image ? (
            <Image
              src={car.image}
              alt={car.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-gray-200">⚡</div>
          )}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white shadow">
              {car.tag}
            </span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-semibold text-green-600">{car.brand}</p>
          <h3 className="mt-0.5 text-base font-black text-gray-900 group-hover:text-green-600 transition line-clamp-1">
            {car.name}
          </h3>
          <p className="mt-1 text-lg font-black text-green-600">{car.priceDisplay}</p>
          {car.emiMin && <p className="text-[11px] text-gray-400">EMI ₹{car.emiMin.toLocaleString()}/mo</p>}

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <SpecPill icon={<BatteryCharging size={12} className="text-green-600" />}  label="Range" value={car.specs?.range_certified?.split(" (")[0]} bg="bg-green-50"  />
            <SpecPill icon={<Zap            size={12} className="text-blue-600"  />}  label="Motor" value={car.specs?.motor?.split(" /")[0]}            bg="bg-blue-50"   />
            <SpecPill icon={<Gauge          size={12} className="text-purple-600"/>}  label="Speed" value={car.specs?.top_speed}                        bg="bg-purple-50" />
          </div>

          {car.colors?.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">{car.colors.length} Colors:</span>
              {car.colors.slice(0, 5).map((c, i) => (
                <div key={i} title={c.name} className="h-4 w-4 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: c.hex || c.hexCode || "#888" }} />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{car.rating || "—"}</span>
              {car.reviewCount > 0 && <span className="text-[10px] text-gray-400">({car.reviewCount.toLocaleString()})</span>}
            </div>
            <span className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white group-hover:bg-green-500 transition">
              Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SpecPill({ icon, label, value, bg }) {
  return (
    <div className={`rounded-xl ${bg} p-2 text-center`}>
      <div className="mb-0.5 flex justify-center">{icon}</div>
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-[11px] font-black text-gray-800 leading-tight">{value || "—"}</p>
    </div>
  );
}
