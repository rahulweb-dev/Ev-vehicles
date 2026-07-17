"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "How many EVs were sold in India in 2025?", a: "India sold over 17 lakh (1.7 million) electric vehicles in 2025 across all segments — cars, two-wheelers, and commercial vehicles — making it one of the fastest-growing EV markets globally. Two-wheelers account for the largest share at around 60% of total EV sales, followed by electric cars at approximately 30%." },
  { q: "Which is the best-selling electric car in India in 2025?", a: "Tata EV (Tata Nexon EV and Tiago EV combined) leads the electric car segment in India with a market share exceeding 50%. MG EV, Mahindra EV (XEV 9e, BE 6e), BYD, and Hyundai Creta Electric follow in the rankings." },
  { q: "Which electric scooter sells the most in India?", a: "Ola Electric is the best-selling electric two-wheeler brand in India in 2025, followed by TVS iQube, Ather Energy, Bajaj Chetak, and Hero Vida. The electric two-wheeler segment crossed 10 lakh annual sales for the first time in India in 2025." },
  { q: "Which state has the highest EV adoption in India?", a: "Uttar Pradesh leads in total EV registrations, largely driven by high electric two-wheeler adoption. Maharashtra, Karnataka, Tamil Nadu, and Rajasthan follow closely. Delhi leads in EV adoption rate relative to total vehicle registrations, supported by strong state-level subsidies and a robust charging network." },
  { q: "What is the EV market share of electric cars vs two-wheelers vs commercial vehicles in India?", a: "In India's EV market in 2025, electric two-wheelers (e-scooters and e-bikes) hold approximately 60% market share by volume, electric cars account for about 30%, and commercial electric vehicles (e-buses, e-trucks, e-three-wheelers) make up the remaining 10%. By value, however, electric cars account for a larger share due to their higher price point." },
  { q: "Is India's EV market growing?", a: "Yes, India's EV market is among the fastest-growing in the world. EV sales grew at over 30% year-over-year in 2025, driven by a combination of government incentives under the PM E-Drive scheme, falling battery prices, wider model availability, and growing consumer awareness about fuel cost savings. The Indian government targets 30% EV penetration by 2030." },
  { q: "Which EV brand has the highest market share in India?", a: "In the electric car segment, Tata EV holds over 50% market share. In electric two-wheelers, Ola Electric leads with approximately 35% share. In commercial EVs, Tata EV Commercial dominates. Overall, the Tata Group is the largest EV seller in India by volume across segments." },
  { q: "How is EV sales data collected on this page?", a: "The EV sales data on EV News India is sourced from official VAHAN (government vehicle registration) data, manufacturer-released monthly wholesale numbers, and industry body reports from SMEV (Society of Manufacturers of Electric Vehicles) and FADA (Federation of Automobile Dealers Associations). Data is updated monthly and may differ slightly from final audited figures." },
];

function FAQ({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.q}</span>
            <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
import { Car, Bike, Truck, TrendingUp, MapPin, BarChart2, Zap } from "lucide-react";
import StatCard from "@/components/ev-sales/StatCard";
import BarChart from "@/components/ev-sales/BarChart";
import HBarChart from "@/components/ev-sales/HBarChart";
import DonutChart from "@/components/ev-sales/DonutChart";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso) {
  if (!iso) return "July 2025";
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function EVSalesDashboard({ data = {} }) {
  const [activeSegment, setActiveSegment] = useState("all");

  const {
    grandTotal = 0,
    totals = {},
    brandRankings = [],
    monthlyTrend = [],
    segmentBreakdown = [],
    stateSales = [],
    isFallback,
  } = data;

  // Monthly trend data formatted for BarChart
  const monthlyData = monthlyTrend.map((m) => ({
    month: MONTH_NAMES[(m.month || 1) - 1],
    totalUnits: m.totalUnits || 0,
  }));

  // Filter brand rankings by segment
  const filteredBrands =
    activeSegment === "all"
      ? brandRankings
      : brandRankings.filter((b) => b.segment === activeSegment);

  const carGrowth = totals.car?.avgGrowth;
  const twGrowth = totals["two-wheeler"]?.avgGrowth;
  const commGrowth = totals.commercial?.avgGrowth;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Live Intelligence</span>
                {isFallback && (
                  <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">Sample Data</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                EV Sales Intelligence
              </h1>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400 max-w-xl">
                Monthly EV market insights for India — cars, two-wheelers, commercial vehicles.
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Last updated: {fmtDate(new Date().toISOString())} · Source: EV Radar Research
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/ev-sales/cars" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold hover:bg-blue-100 transition">
                <Car size={15} /> Cars
              </Link>
              <Link href="/ev-sales/two-wheelers" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold hover:bg-green-100 transition">
                <Bike size={15} /> Two-Wheelers
              </Link>
              <Link href="/ev-sales/commercial" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-bold hover:bg-purple-100 transition">
                <Truck size={15} /> Commercial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stat Cards */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total EV Sales" value={grandTotal} icon={Zap} color="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" index={0} />
            <StatCard label="EV Car Sales" value={totals.car?.totalUnits || 0} growth={carGrowth} icon={Car} color="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" index={1} />
            <StatCard label="Two-Wheeler Sales" value={totals["two-wheeler"]?.totalUnits || 0} growth={twGrowth} icon={Bike} color="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" index={2} />
            <StatCard label="Commercial Sales" value={totals.commercial?.totalUnits || 0} growth={commGrowth} icon={Truck} color="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" index={3} />
            <StatCard label="Market Growth" value={totals.car?.avgGrowth || 0} icon={TrendingUp} color="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" index={4} suffix="%" />
            <StatCard label="States Covered" value={stateSales.length} icon={MapPin} color="bg-rose-50 dark:bg-rose-900/20" iconColor="text-rose-600" index={5} />
          </div>
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">Monthly EV Growth Trend</h2>
                <p className="text-xs text-gray-400 mt-0.5">Total units sold per month · 2025</p>
              </div>
              <BarChart2 size={18} className="text-green-500" />
            </div>
            <BarChart data={monthlyData} labelKey="month" valueKey="totalUnits" color="bg-green-500" />
          </div>

          {/* Segment Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">EV Segment Distribution</h2>
                <p className="text-xs text-gray-400 mt-0.5">Share by vehicle type</p>
              </div>
            </div>
            <DonutChart data={segmentBreakdown} labelKey="segment" valueKey="totalUnits" />
          </div>
        </section>

        {/* Brand Rankings */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white">Top EV Brands</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by total units sold · 2025</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[["all", "All"], ["car", "Cars"], ["two-wheeler", "2W"], ["commercial", "Commercial"]].map(([seg, label]) => (
                <button
                  key={seg}
                  onClick={() => setActiveSegment(seg)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeSegment === seg
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <HBarChart data={filteredBrands} labelKey="brand" valueKey="totalUnits" segmentKey="segment" maxItems={10} />
        </section>

        {/* State Adoption */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white">State-wise EV Adoption</h2>
              <p className="text-xs text-gray-400 mt-0.5">Total EV units sold by state · 2025</p>
            </div>
            <Link href="/ev-adoption-states" className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline">
              View All States →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left pb-3 pr-4">#</th>
                  <th className="text-left pb-3 pr-4">State</th>
                  <th className="text-right pb-3 pr-4">Total EV Units</th>
                  <th className="text-right pb-3">Avg Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {stateSales.slice(0, 10).map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 pr-4 text-xs font-bold text-gray-400">{i + 1}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-800 dark:text-gray-200">{s.state}</td>
                    <td className="py-3 pr-4 text-right font-bold text-gray-900 dark:text-white">
                      {(s.totalUnits || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-bold ${(s.avgGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {(s.avgGrowth || 0) >= 0 ? "+" : ""}{(s.avgGrowth || 0).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: "/ev-market-share", label: "EV Market Share", desc: "Brand vs brand breakdown", color: "from-blue-500 to-blue-700" },
            { href: "/top-selling-evs", label: "Top Selling EVs", desc: "Best-selling models 2025", color: "from-green-500 to-green-700" },
            { href: "/ev-adoption-states", label: "State Adoption", desc: "City & state level data", color: "from-purple-500 to-purple-700" },
            { href: "/ev-sales/two-wheelers", label: "2W Intelligence", desc: "Two-wheeler EV data", color: "from-amber-500 to-amber-700" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-2xl bg-linear-to-br ${l.color} p-5 text-white hover:opacity-90 transition`}
            >
              <p className="font-black text-sm">{l.label}</p>
              <p className="text-xs text-white/70 mt-1">{l.desc}</p>
            </Link>
          ))}
        </section>

        {/* Editorial Content */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">India EV Market Overview 2025</h2>
          <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed">
            <p>
              India's electric vehicle (EV) market in 2025 has crossed a significant milestone, with total EV sales surpassing
              17 lakh units annually. This represents a year-on-year growth of over 30%, making India one of the top five largest
              EV markets in the world. The growth is being driven by a combination of central government incentives, state-level
              subsidies, falling battery costs, and a rapidly expanding range of affordable EV models across segments.
            </p>
            <p>
              The electric two-wheeler segment continues to dominate India's EV landscape, accounting for over 60% of total
              sales by volume. Brands like Ola Electric, TVS iQube, Ather Energy, Bajaj Chetak, and Hero Vida have collectively
              brought electric mobility to millions of urban and semi-urban Indian consumers. The electric car segment, led by
              Tata EV with over 50% market share, has also seen strong growth with the addition of new models from Mahindra,
              MG, Hyundai, and BYD.
            </p>
            <p>
              Commercial electric vehicles — including e-buses, e-trucks, and electric three-wheelers — are increasingly being
              adopted by logistics companies, public transport operators, and last-mile delivery fleets. Tata EV Commercial and
              Ashok Leyland EV lead this segment, supported by fleet electrification mandates under the PM E-Drive scheme and
              state-level electric bus procurement programmes.
            </p>
            <p>
              Geographically, Uttar Pradesh leads in total EV registrations driven by strong two-wheeler adoption, while
              Maharashtra, Karnataka, Tamil Nadu, and Delhi round out the top five states. Karnataka, home to Bangalore's large
              tech workforce, has one of the highest EV adoption rates among urban populations. The government's FAME III scheme
              and state EV policies from Rajasthan, Gujarat, and Telangana have also significantly boosted EV penetration in
              those markets.
            </p>
            <p>
              The data on this page is sourced from VAHAN (government vehicle registration portal), manufacturer-released
              wholesale figures, and reports from SMEV and FADA. All figures are updated monthly and represent the most current
              available data for India's EV market.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Frequently Asked Questions — India EV Sales</h2>
          <FAQ items={FAQS} />
        </section>
      </div>
    </main>
  );
}
