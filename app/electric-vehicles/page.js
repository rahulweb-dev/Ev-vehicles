import Link from "next/link";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";
import { BatteryCharging, Zap, Home, ChevronRight } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "EV Charging News India – Fast Charging, Battery Swapping & Infrastructure 2026",
  description:
    "Latest EV charging infrastructure news in India. Fast chargers, battery swapping, home charging tips, charging costs, and India's expanding charging network.",
  alternates: { canonical: `${SITE_URL}/electric-vehicles` },
};

const CHARGING_TYPES = [
  {
    icon: Home,
    title: "Home Charging (AC)",
    speed: "3.3 – 7.2 kW",
    time: "6 – 12 hours",
    desc: "Level 1/2 AC chargers installed at home using a standard 15A or dedicated EV socket. Cheapest per-unit cost.",
    color: "border-green-100 text-green-600 bg-green-50",
  },
  {
    icon: BatteryCharging,
    title: "Public AC Charger",
    speed: "7.2 – 22 kW",
    time: "2 – 6 hours",
    desc: "Found in malls, offices and parking lots. Bharat AC-001 standard ensures compatibility across brands.",
    color: "border-blue-100 text-blue-600 bg-blue-50",
  },
  {
    icon: Zap,
    title: "DC Fast Charger",
    speed: "25 – 150 kW",
    time: "30 – 90 mins",
    desc: "CCS2 and CHAdeMO connectors at highways and Tata Power, EESL, Ather grid stations. 80% charge in ~45 min.",
    color: "border-orange-100 text-orange-600 bg-orange-50",
  },
  {
    icon: Zap,
    title: "Battery Swapping",
    speed: "Instant",
    time: "< 5 minutes",
    desc: "Swap a depleted battery for a charged one at Gogoro, Sun Mobility, and Ola swap stations — zero wait time.",
    color: "border-purple-100 text-purple-600 bg-purple-50",
  },
];

export default function EVChargingPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">EV Charging</span>
          </nav>
          <h1 className="text-4xl font-black text-white md:text-5xl">EV Charging &amp; Infrastructure</h1>
          <p className="mt-2 text-green-300">India&apos;s growing EV charging ecosystem — news, guides &amp; updates</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <AdBannerHorizontal slot="1357924680" />

        {/* Charging type cards — always visible */}
        <div className="mt-10">
          <h2 className="mb-6 text-2xl font-black text-gray-900">Types of EV Charging in India</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CHARGING_TYPES.map(({ icon: Icon, title, speed, time, desc, color }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-black text-gray-900 mb-1">{title}</h3>
                <div className="flex gap-3 mb-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{speed}</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{time}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Articles from DB */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-black text-gray-900">Latest EV Charging News</h2>
          <ArticlesFeed category="charging" skeletonCount={6} />
        </div>

        {/* Blog CTA */}
        <div className="mt-10 rounded-2xl bg-green-50 border border-green-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-gray-900">New to EV Charging?</h3>
            <p className="text-sm text-gray-500 mt-1">Read our complete guide to EV charger types, costs, and installation in India.</p>
          </div>
          <Link href="/blogs/ev-charging-types-india-guide-ac-dc-fast-charging"
            className="shrink-0 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
            Read the Guide →
          </Link>
        </div>
      </div>
    </div>
  );
}
