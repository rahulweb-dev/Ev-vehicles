'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Menu, X, ChevronDown, Search, Car, Bike,
  BarChart2, Newspaper, Home, BookOpen, Mail,
  Info, ArrowRight, Zap, ChevronRight,
} from 'lucide-react'
import SearchModal from './SearchModal'
import { electricCars } from '@/data/vehiclesData'
import { electricBikes } from '@/data/vehiclesData'

const ALL_VEHICLES = [
  ...electricCars.map((v) => ({ ...v, vehicleType: 'cars' })),
  ...electricBikes.map((v) => ({ ...v, vehicleType: 'bikes' })),
]

const DESKTOP_NAV = [
  { title: 'Home', link: '/' },
  {
    title: 'News',
    link: '/news',
    dropdown: [
      { name: 'All EV News', href: '/news' },
      { name: 'Electric Cars News', href: '/cars' },
      { name: 'Electric Bikes & Scooters', href: '/bikes' },
      { name: 'Commercial EVs', href: '/commercial' },
      { name: 'EV Charging', href: '/electric-vehicles' },
    ],
  },
  {
    title: 'Vehicles',
    link: '/cars',
    dropdown: [
      { name: 'Popular Electric Cars', href: '/cars', icon: Car },
      { name: 'Popular Electric Bikes', href: '/bikes', icon: Bike },
      { name: 'Commercial EVs', href: '/commercial', icon: Zap },
    ],
  },
  { title: 'Compare', link: '/compare' },
  { title: 'Blogs', link: '/blogs' },
  { title: 'About', link: '/about' },
  { title: 'Contact', link: '/contact' },
]

const MOBILE_QUICK = [
  { label: 'Cars', href: '/cars', icon: Car, color: 'bg-blue-50 text-blue-600' },
  { label: 'Bikes', href: '/bikes', icon: Bike, color: 'bg-orange-50 text-orange-600' },
  { label: 'Compare', href: '/compare', icon: BarChart2, color: 'bg-green-50 text-green-600' },
  { label: 'News', href: '/news', icon: Newspaper, color: 'bg-red-50 text-red-600' },
]

const MOBILE_NAV = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'Electric Cars', href: '/cars', icon: Car },
  { title: 'Electric Bikes', href: '/bikes', icon: Bike },
  { title: 'Compare Vehicles', href: '/compare', icon: BarChart2 },
  { title: 'Latest News', href: '/news', icon: Newspaper },
  { title: 'Blogs', href: '/blogs', icon: BookOpen },
  { title: 'About Us', href: '/about', icon: Info },
  { title: 'Contact', href: '/contact', icon: Mail },
]

/* ─── Mobile Inline Search ─────────────────────────────────────────── */
function MobileSearch({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return ALL_VEHICLES
      .filter((v) => v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query])

  return (
    <div className="px-4 pb-3 pt-1">
      {/* Input */}
      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-green-400 focus-within:bg-white transition">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search EV cars, bikes, brands…"
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        {query && (
          <button onClick={() => setQuery('')} className="shrink-0 text-gray-400">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-2 rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
          {results.map((v) => (
            <Link
              key={`${v.vehicleType}-${v.id}`}
              href={`/${v.vehicleType}/${v.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition"
            >
              <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <Image src={v.image} alt={v.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-600">{v.brand}</p>
                <p className="text-sm font-bold text-gray-800 truncate">{v.name}</p>
                <p className="text-xs text-gray-400">{v.priceDisplay}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                v.vehicleType === 'cars' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {v.vehicleType === 'cars' ? 'Car' : 'Bike'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <p className="mt-3 text-center text-sm text-gray-400">
          No results for &quot;{query}&quot;
        </p>
      )}
    </div>
  )
}

/* ─── Main Navbar ──────────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)

  const closeMenu = () => { setMobileOpen(false); setMobileSearch(false) }

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl">
        {/* Top Ticker Bar */}
        <div className="border-b border-gray-100 bg-gray-950 text-white">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs">
            <p className="flex items-center gap-2 text-gray-300">
              <span className="text-yellow-400">⚡</span>
              <span className="hidden sm:inline">Trending: </span>
              <span className="hidden sm:inline">
                <Link href="/news/tata-harrier-ev-launched-india-price-range-features-2026" className="hover:text-green-400 transition">Tata Harrier EV</Link>
                {' • '}
                <Link href="/news/mahindra-be6-electric-suv-review-range-performance-2026" className="hover:text-green-400 transition">Mahindra BE 6</Link>
                {' • '}
                <Link href="/news/tesla-model-3-highland-india-launch-price-2026" className="hover:text-green-400 transition">Tesla Model 3</Link>
              </span>
              <span className="sm:hidden text-gray-400">EV News India</span>
            </p>
            <span className="animate-pulse rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wide">
              LIVE
            </span>
          </div>
        </div>

        {/* Main Bar */}
        <nav className="mx-auto flex h-16.5 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/logo.png"
              alt="EV News India"
              height={44}
              width={140}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-6 lg:flex">
            {DESKTOP_NAV.map((item, i) => (
              <div key={i} className="group relative">
                <Link
                  href={item.link}
                  className={`flex items-center gap-1 text-[13.5px] font-semibold transition
                    ${item.title === 'Compare'
                      ? 'rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-green-700 hover:bg-green-100'
                      : 'text-gray-700 hover:text-green-600'
                    }`}
                >
                  {item.title === 'Compare' && <BarChart2 size={13} />}
                  {item.title}
                  {item.dropdown && (
                    <ChevronDown size={13} className="transition duration-300 group-hover:rotate-180" />
                  )}
                </Link>

                {item.title !== 'Compare' && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-green-600 transition-all duration-300 group-hover:w-full" />
                )}

                {item.dropdown && (
                  <div className="invisible absolute left-0 top-9 w-58 translate-y-2 rounded-2xl border border-gray-100 bg-white p-2 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.dropdown.map((drop, di) => (
                      <Link
                        key={di}
                        href={drop.href}
                        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                      >
                        {drop.icon && <drop.icon size={15} className="text-green-500" />}
                        {drop.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <SearchModal />
            <Link
              href="/news"
              className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-green-700"
            >
              Latest News
            </Link>
          </div>

          {/* Mobile Right Buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Search Icon */}
            <button
              onClick={() => { setMobileSearch(!mobileSearch); setMobileOpen(true) }}
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              <Search size={18} />
            </button>

            {/* Hamburger */}
            <button
              onClick={() => { setMobileOpen(!mobileOpen); setMobileSearch(false) }}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Drawer Overlay ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-150 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <Link href="/" onClick={closeMenu}>
                <Image
                  src="/images/logo.png"
                  alt="EV News India"
                  height={36}
                  width={115}
                  className="object-contain"
                />
              </Link>
              <button
                onClick={closeMenu}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">

              {/* Inline Search */}
              <div className="border-b border-gray-100 py-3">
                <MobileSearch onClose={closeMenu} />
              </div>

              {/* Quick Category Pills */}
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Browse by Category
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {MOBILE_QUICK.map(({ label, href, icon: Icon, color }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={closeMenu}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl ${color} py-3 text-center transition hover:opacity-80`}
                    >
                      <Icon size={20} />
                      <span className="text-[11px] font-bold">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="px-4 py-3">
                <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Navigation
                </p>
                <nav className="space-y-0.5">
                  {MOBILE_NAV.map(({ title, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition
                        ${href === '/compare'
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                        }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                        ${href === '/compare'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-500'
                        } transition`}
                      >
                        <Icon size={16} />
                      </span>
                      {title}
                      <ChevronRight size={15} className="ml-auto text-gray-300 group-hover:text-green-400 transition" />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Drawer Footer CTAs */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-2.5 bg-gray-50">
              <Link
                href="/compare"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-green-600 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50"
              >
                <BarChart2 size={17} /> Compare Vehicles
              </Link>
              <Link
                href="/news"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-green-700"
              >
                <Newspaper size={17} /> Latest EV News <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
