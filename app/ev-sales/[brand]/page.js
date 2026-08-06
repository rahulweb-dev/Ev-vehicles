import { SITE_URL, SITE_NAME } from "@/app/layout";
import BrandSalesPage from "./BrandSalesPage";
import { FALLBACK_ANALYTICS, CAR_BRANDS, TWO_WHEELER_BRANDS, COMMERCIAL_BRANDS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

const CAR_BRANDS_WITH_SEG = CAR_BRANDS.map((b) => ({ ...b, name: b.brand, slug: b.brandSlug, segment: "car", monthlySales: b.sales }));
const TW_BRANDS_WITH_SEG  = TWO_WHEELER_BRANDS.map((b) => ({ ...b, name: b.brand, slug: b.brandSlug, segment: "two-wheeler", monthlySales: b.sales }));
const COM_BRANDS_WITH_SEG = COMMERCIAL_BRANDS.map((b) => ({ ...b, name: b.brand, slug: b.brandSlug, segment: "commercial", monthlySales: b.sales }));
const ALL_BRANDS = [...CAR_BRANDS_WITH_SEG, ...TW_BRANDS_WITH_SEG, ...COM_BRANDS_WITH_SEG];

export async function generateMetadata({ params }) {
  const slug = params.brand;
  const brand = ALL_BRANDS.find((b) => b.slug === slug);
  const name = brand?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const segment = brand?.segment === "two-wheeler" ? "Two-Wheeler" : brand?.segment === "commercial" ? "Commercial" : "Car";
  return {
    title: `${name} EV Sales India 2025 – Monthly Data & Market Share | ${SITE_NAME}`,
    description: `${name} electric ${segment.toLowerCase()} sales data India 2025 — monthly units sold, market share, year-over-year growth.`,
    alternates: { canonical: `${SITE_URL}/ev-sales/${slug}` },
    openGraph: {
      title: `${name} EV Sales India 2025`,
      description: `${name} monthly electric vehicle sales data, market share and growth for India.`,
      url: `${SITE_URL}/ev-sales/${slug}`,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(name + " EV Sales 2025")}&subtitle=Monthly Data %26 Market Share India&tag=analytics&type=page`, width: 1200, height: 630, alt: `${name} EV Sales India 2025` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} EV Sales India 2025`,
      description: `${name} monthly electric vehicle sales data, market share and growth for India.`,
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(name + " EV Sales 2025")}&subtitle=Monthly Data %26 Market Share India&tag=analytics&type=page`],
    },
  };
}

async function getBrandData(slug) {
  try {
    const res = await fetch(`${SITE_URL}/api/ev-sales?brandSlug=${slug}&year=2025`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    if (!json.data?.length) throw new Error("no data");
    return json.data;
  } catch {
    const brand = ALL_BRANDS.find((b) => b.slug === slug);
    if (!brand) return [];
    const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return MONTHS.map((month) => ({
      brand: brand.name,
      brandSlug: brand.slug,
      segment: brand.segment,
      month,
      year: 2025,
      unitsSold: brand.monthlySales?.[month - 1] || 0,
      state: "National",
      isNational: true,
    }));
  }
}

export default async function EVBrandPage({ params }) {
  const slug = params.brand;
  const records = await getBrandData(slug);
  const brand = ALL_BRANDS.find((b) => b.slug === slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${brand?.name || slug} EV Sales Data India 2025`,
    description: `Monthly EV sales data for ${brand?.name || slug} in India.`,
    url: `${SITE_URL}/ev-sales/${slug}`,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    spatialCoverage: { "@type": "Country", name: "India" },
    temporalCoverage: "2025",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BrandSalesPage records={records} brandSlug={slug} brandMeta={brand} />
    </>
  );
}
