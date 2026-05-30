import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";

export const revalidate = 60;

export const metadata = {
  title: "EV Charging News India – Fast Charging, Battery Swapping & Infrastructure 2026",
  description:
    "Latest EV charging infrastructure news in India. Fast chargers, battery swapping, home charging tips, charging costs, and India's expanding charging network.",
  alternates: { canonical: `${SITE_URL}/electric-vehicles` },
};

export default function EVChargingPage() {
  return (
    <div className="bg-white">
      {/* Header — instant */}
      <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 text-sm text-green-300">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white">EV Charging</span>
          </nav>
          <h1 className="text-4xl font-black text-white">EV Charging &amp; Infrastructure</h1>
          <p className="mt-2 text-green-300">India&apos;s growing EV charging ecosystem — news, guides, and updates</p>
        </div>
      </div>

      {/* Articles — skeleton on mount, real data after fetch */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AdBannerHorizontal slot="1357924680" />
        <div className="mt-8">
          <ArticlesFeed category="charging" skeletonCount={6} />
        </div>
      </div>
    </div>
  );
}
