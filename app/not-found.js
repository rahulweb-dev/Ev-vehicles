"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Search, Car, Newspaper, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const QUICK_LINKS = [
  { href: "/cars",    label: "Electric Cars",  desc: "Browse all EVs" },
  { href: "/bikes",   label: "Electric Bikes", desc: "Scooters & bikes" },
  { href: "/news",    label: "EV News",        desc: "Latest updates" },
  { href: "/compare", label: "Compare EVs",    desc: "Side-by-side" },
];

export default function NotFound() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        {/* 404 graphic */}
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-green-50 border-2 border-green-100">
          <span className="text-5xl font-black text-green-600">⚡</span>
        </div>

        <h1 className="text-7xl font-black text-gray-900">404</h1>
        <h2 className="mt-2 text-2xl font-black text-gray-800">Page Not Found</h2>
        <p className="mt-4 text-gray-500 leading-relaxed">
          This page has gone off the grid — just like an EV running on empty.
          Search for what you need below.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-8 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-green-500 transition">
            <Search size={16} className="shrink-0 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search EVs, news, brands…"
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!q.trim()}
            className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-40"
          >
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
          >
            <Home size={16} /> Back to Home
          </Link>
          <Link
            href="/news"
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            <Newspaper size={16} /> Latest EV News
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {QUICK_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-green-200 hover:shadow-md transition"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition">{link.label}</p>
                <p className="text-xs text-gray-400">{link.desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-green-600 transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
