"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, Bike, Truck, BatteryCharging, Clock3, ArrowRight, Bookmark } from "lucide-react";

const tabs = [
  { id: "cars",       name: "Cars",       icon: <Car size={18} /> },
  { id: "bikes",      name: "Bikes",      icon: <Bike size={18} /> },
  { id: "commercial", name: "Commercial", icon: <Truck size={18} /> },
  { id: "charging",   name: "Charging",   icon: <BatteryCharging size={18} /> },
];

const newsData = {
  cars: {
    featured: {
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop",
      title: "Tata Harrier EV Launched In India – Price, Range & Features Revealed",
      desc: "Tata Motors unveils the Harrier EV with 500km range and Level 2 ADAS at ₹24.49 Lakh.",
      href: "/news/tata-harrier-ev-launched-india-price-range-features-2026",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=400&auto=format&fit=crop", title: "Tesla Model 3 Long Range Now Available In India", tag: "Launch", href: "/cars" },
      { image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=400&auto=format&fit=crop", title: "Mahindra BE 6 Crosses 20,000 Bookings In 48 Hours", tag: "Trending", href: "/news/mahindra-be6-electric-suv-review-range-performance-2026" },
      { image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop", title: "BYD Announces 1000km Range EV For India 2027", tag: "Update", href: "/cars" },
      { image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop", title: "Upcoming Compact Electric SUVs Launching In 2026", tag: "Upcoming", href: "/cars" },
    ],
  },
  bikes: {
    featured: {
      image: "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=1600&auto=format&fit=crop",
      title: "Ather 450X Gen 4 Officially Revealed With 146km Range",
      desc: "Ather launches next-gen electric scooter with improved battery, Google Maps, and faster charging.",
      href: "/bikes",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=400&auto=format&fit=crop", title: "Ola S1 Pro Gets Massive OTA Software Update", tag: "Update", href: "/bikes" },
      { image: "https://images.unsplash.com/photo-1517846693594-1567da72af75?q=80&w=400&auto=format&fit=crop", title: "TVS iQube ST Extended — Best Value Electric Scooter?", tag: "Review", href: "/bikes" },
      { image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=400&auto=format&fit=crop", title: "Ultraviolette F77 Mach 2: India's Fastest EV Bike", tag: "Trending", href: "/bikes/ultraviolette-f77" },
    ],
  },
  commercial: {
    featured: {
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1600&auto=format&fit=crop",
      title: "Volvo Introduces Next Generation Electric Trucks In India",
      desc: "Commercial EVs are reshaping Indian logistics with 300km range and lower TCO.",
      href: "/commercial",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=400&auto=format&fit=crop", title: "Ashok Leyland Expands EV Bus Production Capacity", tag: "Industry", href: "/commercial" },
      { image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=400&auto=format&fit=crop", title: "Electric Cargo Vans See 300% Growth In Indian Cities", tag: "Trending", href: "/commercial" },
    ],
  },
  charging: {
    featured: {
      image: "https://images.unsplash.com/photo-1678358181658-9e2d9b1aeb9f?q=80&w=1600&auto=format&fit=crop",
      title: "India Plans 50,000 New EV Charging Stations By 2027",
      desc: "Government accelerates EV charging infrastructure expansion across Tier 2 & 3 cities.",
      href: "/electric-vehicles",
    },
    sideNews: [
      { image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=400&auto=format&fit=crop", title: "DC Fast Charging Speed Improves By 40% With New Tech", tag: "Technology", href: "/electric-vehicles" },
      { image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=400&auto=format&fit=crop", title: "Battery Swapping Gains Momentum In Indian Cities", tag: "Charging", href: "/electric-vehicles" },
    ],
  },
};

export default function LatestNews() {
  const [active, setActive] = useState("cars");
  const current = newsData[active];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div className="mb-10">
          <h2 className="text-4xl font-black md:text-5xl">
            Latest <span className="text-green-400">EV News</span>
          </h2>
          <p className="mt-3 text-lg text-gray-400">
            Breaking electric vehicle updates &amp; future mobility trends.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex flex-wrap gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                active === tab.id
                  ? "border-green-400 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-green-400/30 hover:bg-white/10"
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">
          {/* Featured */}
          <div className="group relative overflow-hidden rounded-4xl border border-white/10 bg-white/5">
            <div className="relative h-75 md:h-137.5">
              <Image
                src={current.featured.image}
                alt="featured"
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
              <div className="absolute left-6 top-6 rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400 backdrop-blur-xl">
                FEATURED
              </div>
              <div className="absolute bottom-0 p-6 md:p-10">
                <h3 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">
                  {current.featured.title}
                </h3>
                <p className="mt-5 max-w-2xl text-gray-300 md:text-lg">
                  {current.featured.desc}
                </p>
                <div className="mt-6 flex items-center gap-5 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock3 size={15} />
                    6 min read
                  </div>
                </div>
                <Link
                  href={current.featured.href}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-green-400 to-blue-500 px-7 py-4 font-semibold text-black transition hover:scale-105"
                >
                  Read Full Story
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          {/* Side News */}
          <div className="h-137.5 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            {current.sideNews.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group flex gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 transition hover:border-green-400/30 hover:bg-white/10"
              >
                <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="mb-3 inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                      {item.tag}
                    </div>
                    <h4 className="text-base font-bold leading-snug transition group-hover:text-green-400">
                      {item.title}
                    </h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock3 size={14} />
                      4 min read
                    </div>
                    <Bookmark size={18} className="cursor-pointer transition hover:text-green-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
