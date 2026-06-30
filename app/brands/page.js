import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Car, Bike, Truck } from "lucide-react";
import { SITE_URL, SITE_NAME } from "../layout";

export const revalidate = 3600;

export const metadata = {
  title: `EV Brands in India 2026 – All Electric Vehicle Manufacturers | ${SITE_NAME}`,
  description:
    "Explore all electric vehicle brands in India. Browse cars, bikes, and commercial EVs by manufacturer — Tata, Mahindra, Ather, Ola, Hyundai, BYD, Kia, and more.",
  alternates: { canonical: `${SITE_URL}/brands` },
  openGraph: {
    title: "EV Brands in India 2026 – All Electric Vehicle Manufacturers",
    description: "Browse all EV brands selling in India — Tata, Mahindra, Ather, Ola, Hyundai, BYD, Kia, MG and more.",
    url: `${SITE_URL}/brands`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Brands India 2026&subtitle=All electric vehicle manufacturers in India&tag=cars&type=page`, width: 1200, height: 630, alt: "EV Brands in India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Brands in India 2026 – All Electric Vehicle Manufacturers",
    description: "Browse all EV brands in India — Tata, Mahindra, Ather, Ola, Hyundai, BYD, Kia and more.",
    images: [`${SITE_URL}/api/og?title=EV Brands India 2026&subtitle=All electric vehicle manufacturers in India&tag=cars&type=page`],
  },
};

async function getBrandsWithVehicles() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    const Brand     = (await import("@/lib/models/Brand")).default;
    await dbConnect();

    const [vehicles, brandProfiles] = await Promise.all([
      Vehicle.find({ status: "published" })
        .select("brand vehicleType slug")
        .lean(),
      Brand.find({}).lean(),
    ]);

    const brandMap = {};
    vehicles.forEach(v => {
      if (!v.brand) return;
      if (!brandMap[v.brand]) brandMap[v.brand] = { cars: 0, bikes: 0, commercial: 0, total: 0 };
      const key = v.vehicleType === "car" ? "cars" : v.vehicleType === "bike" ? "bikes" : "commercial";
      brandMap[v.brand][key]++;
      brandMap[v.brand].total++;
    });

    const profileMap = {};
    brandProfiles.forEach(b => { profileMap[b.name] = b; });

    return Object.entries(brandMap)
      .map(([name, counts]) => ({
        name,
        slug: profileMap[name]?.slug || name.toLowerCase().replace(/\s+/g, "-"),
        logo: profileMap[name]?.logo || "",
        description: profileMap[name]?.description || "",
        website: profileMap[name]?.website || "",
        ...counts,
      }))
      .sort((a, b) => b.total - a.total);
  } catch {
    return [];
  }
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "EV Brands", item: `${SITE_URL}/brands` },
  ],
};

export default async function BrandsPage() {
  const brands = await getBrandsWithVehicles();

  const carBrands        = brands.filter(b => b.cars > 0);
  const bikeBrands       = brands.filter(b => b.bikes > 0 && b.cars === 0);
  const commercialBrands = brands.filter(b => b.commercial > 0 && b.cars === 0 && b.bikes === 0);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Electric Vehicle Brands in India",
    url: `${SITE_URL}/brands`,
    numberOfItems: brands.length,
    itemListElement: brands.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      url: `${SITE_URL}/brands/${b.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-linear-to-br from-gray-900 to-gray-950 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">EV Brands</span>
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              EV Brands <span className="text-green-400">in India</span>
            </h1>
            <p className="mt-3 text-gray-400 max-w-2xl">
              All electric vehicle manufacturers selling in India — from Tata and Mahindra to Ather, Ola Electric, Hyundai, BYD, and more.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1 text-white">{brands.length} Brands</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-white">{carBrands.length} Car Brands</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-white">{bikeBrands.length} Bike Brands</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">

          {/* Electric Car Brands */}
          {carBrands.length > 0 && (
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-900">
                <Car size={24} className="text-green-600" /> Electric Car Brands
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {carBrands.map(brand => (
                  <Link
                    key={brand.name}
                    href={`/brands/${brand.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-200 hover:shadow-md transition"
                  >
                    {brand.logo ? (
                      <div className="flex h-16 w-full items-center justify-center">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={100}
                          height={50}
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
                        {brand.name[0]}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-bold text-gray-900 group-hover:text-green-700 transition">{brand.name}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{brand.cars} EV{brand.cars !== 1 ? "s" : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Electric Bike Brands */}
          {bikeBrands.length > 0 && (
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-900">
                <Bike size={24} className="text-orange-500" /> Electric Bike & Scooter Brands
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {bikeBrands.map(brand => (
                  <Link
                    key={brand.name}
                    href={`/brands/${brand.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition"
                  >
                    {brand.logo ? (
                      <div className="flex h-16 w-full items-center justify-center">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={100}
                          height={50}
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-xl font-black text-orange-600">
                        {brand.name[0]}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-bold text-gray-900 group-hover:text-orange-600 transition">{brand.name}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{brand.bikes} model{brand.bikes !== 1 ? "s" : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Commercial EV Brands */}
          {commercialBrands.length > 0 && (
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-900">
                <Truck size={24} className="text-purple-600" /> Commercial EV Brands
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {commercialBrands.map(brand => (
                  <Link
                    key={brand.name}
                    href={`/brands/${brand.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-purple-200 hover:shadow-md transition"
                  >
                    {brand.logo ? (
                      <div className="flex h-16 w-full items-center justify-center">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={100}
                          height={50}
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-xl font-black text-purple-600">
                        {brand.name[0]}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-bold text-gray-900 group-hover:text-purple-600 transition">{brand.name}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{brand.commercial} vehicle{brand.commercial !== 1 ? "s" : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {brands.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <p className="text-lg font-semibold">No brands found</p>
              <p className="mt-2 text-sm">Add vehicles in the admin panel to see brands here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
