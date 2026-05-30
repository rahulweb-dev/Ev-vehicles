import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";

export const revalidate = 60;

export const metadata = {
  title: "Commercial Electric Vehicle News India – EV Trucks, Buses & Vans 2026",
  description:
    "Latest commercial EV news in India. Electric trucks, buses, delivery vans, and three-wheelers — launches, prices, and fleet operator reviews.",
  alternates: { canonical: `${SITE_URL}/commercial` },
};


export default function CommercialPage() {
  return (
    <div className="bg-white">
      {/* Header — instant */}
      <div className="bg-linear-to-br from-purple-900 to-purple-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 text-sm text-purple-300">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white">Commercial EVs</span>
          </nav>
          <h1 className="text-4xl font-black text-white">Commercial Electric Vehicles</h1>
          <p className="mt-2 text-purple-300">Electric trucks, buses, and commercial vehicles shaping India&apos;s green logistics</p>
        </div>
      </div>

      {/* Articles — skeleton on mount, real data after fetch */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AdBannerHorizontal slot="0123456789" />
        <div className="mt-8">
          <ArticlesFeed category="commercial" skeletonCount={6} />
        </div>
      </div>
    </div>
  );
}
