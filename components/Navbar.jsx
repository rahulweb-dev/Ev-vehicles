'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Menu, X, ChevronDown, Search, Car, Bike, Truck,
  BarChart2, Newspaper, Home, BookOpen, Mail,
  Info, ArrowRight, Zap, ChevronRight, Wrench, Calculator,
  Leaf, MapPin, TrendingUp,
} from 'lucide-react'
import SearchModal from './SearchModal'
import DarkModeToggle from './DarkModeToggle'

const DESKTOP_NAV = [
  { title: 'Home', link: '/' },
  {
    title: 'News',
    link: '/news',
    dropdown: [
      { name: 'All EV News',             href: '/news'                      },
      { name: 'Electric Cars News',      href: '/news?category=cars'        },
      { name: 'Electric Bikes News',     href: '/news?category=bikes'       },
      { name: 'Commercial EVs News',     href: '/news?category=commercial'  },
      { name: 'EV Charging News',        href: '/news?category=charging'    },
    ],
  },
  {
    title: 'Vehicles',
    link: '/cars',
    dropdown: [
      { name: 'Popular Electric Cars',  href: '/cars',       icon: Car  },
      { name: 'Popular Electric Bikes', href: '/bikes',      icon: Bike },
      { name: 'Commercial EVs',         href: '/commercial', icon: Zap  },
    ],
  },
  { title: 'Compare', link: '/compare' },
  {
    title: 'EV Sales',
    link: '/ev-sales',
    dropdown: [
      { name: 'EV Sales Dashboard',   href: '/ev-sales',            icon: TrendingUp },
      { name: 'Electric Car Sales',   href: '/ev-sales/cars',       icon: Car        },
      { name: 'Two-Wheeler Sales',    href: '/ev-sales/two-wheelers', icon: Bike     },
      { name: 'Commercial EV Sales',  href: '/ev-sales/commercial', icon: Truck      },
      { name: 'EV Market Share',      href: '/ev-market-share',     icon: BarChart2  },
      { name: 'Top Selling EVs',      href: '/top-selling-evs',     icon: Zap        },
      { name: 'State Adoption',       href: '/ev-adoption-states',  icon: MapPin     },
    ],
  },
  {
    title: 'Tools',
    link: '/emi-calculator',
    dropdown: [
      { name: 'EMI Calculator',         href: '/emi-calculator',  icon: Calculator },
      { name: 'EV vs Petrol Savings',   href: '/ev-vs-petrol',    icon: Leaf       },
      { name: 'State EV Subsidies',     href: '/ev-subsidy',      icon: MapPin     },
      { name: 'EV Glossary',            href: '/ev-glossary',     icon: BookOpen   },
    ],
  },
  { title: 'Blogs',   link: '/blogs'   },
  { title: 'About',   link: '/about'   },
  { title: 'Contact', link: '/contact' },
]

const MOBILE_QUICK = [
  { label: 'Cars',     href: '/cars',      icon: Car,        color: 'bg-blue-50 text-blue-600'   },
  { label: 'Bikes',    href: '/bikes',     icon: Bike,       color: 'bg-orange-50 text-orange-600' },
  { label: 'EV Sales', href: '/ev-sales',  icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  { label: 'News',     href: '/news',      icon: Newspaper,  color: 'bg-red-50 text-red-600'     },
]

const MOBILE_NAV = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'Electric Cars', href: '/cars', icon: Car },
  { title: 'Electric Bikes', href: '/bikes', icon: Bike },
  { title: 'Compare Vehicles', href: '/compare', icon: BarChart2 },
  { title: 'EV Sales Data',   href: '/ev-sales', icon: TrendingUp },
  { title: 'EV Market Share', href: '/ev-market-share', icon: BarChart2 },
  { title: 'Top Selling EVs', href: '/top-selling-evs', icon: Zap },
  { title: 'Latest News', href: '/news', icon: Newspaper },
  { title: 'EMI Calculator', href: '/emi-calculator', icon: Calculator },
  { title: 'EV vs Petrol', href: '/ev-vs-petrol', icon: Leaf },
  { title: 'State Subsidies', href: '/ev-subsidy', icon: MapPin },
  { title: 'EV Glossary', href: '/ev-glossary', icon: BookOpen },
  { title: 'Blogs', href: '/blogs', icon: BookOpen },
  { title: 'About Us', href: '/about', icon: Info },
  { title: 'Contact', href: '/contact', icon: Mail },
]

/* ─── Mobile Inline Search — queries live API ───────────────────── */
function MobileSearch({ onClose }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [busy,    setBusy]    = useState(false)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(timerRef.current)
    if (!val.trim()) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setBusy(true)
      try {
        const enc = encodeURIComponent(val)
        const [vRes, aRes] = await Promise.all([
          fetch(`/api/vehicles?search=${enc}&status=published&limit=5`).then(r => r.json()),
          fetch(`/api/articles?search=${enc}&status=published&limit=3`).then(r => r.json()),
        ])
        const vehicles = (vRes.vehicles || []).map(v => ({
          kind: 'vehicle', id: v._id, slug: v.slug,
          vehicleType: v.vehicleType === 'car' ? 'cars' : 'bikes',
          name: v.name, brand: v.brand, image: v.featuredImage || '',
          price: v.variants?.[0]?.exShowroomPrice || 'Price TBA',
        }))
        const articles = (aRes.articles || []).map(a => ({
          kind: 'article', id: a._id, slug: a.slug,
          name: a.title, brand: a.category, image: a.image || '',
          vehicleType: 'news',
        }))
        setResults([...vehicles, ...articles].slice(0, 7))
      } catch { setResults([]) }
      setBusy(false)
    }, 320)
  }

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-green-400 focus-within:bg-white transition">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input ref={inputRef} type="text" value={query} onChange={handleChange}
          placeholder="Search EV cars, bikes, news…"
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
        {query && <button onClick={() => { setQuery(''); setResults([]) }} className="shrink-0 text-gray-400"><X size={15} /></button>}
      </div>

      {busy && <p className="mt-2 text-center text-xs text-gray-400">Searching…</p>}

      {!busy && results.length > 0 && (
        <div className="mt-2 rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
          {results.map((v) => (
            <Link key={`${v.kind}-${v.id}`}
              href={v.kind === 'article' ? `/news/${v.slug}` : `/${v.vehicleType}/${v.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition">
              <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {v.image
                  ? <Image src={v.image} alt={v.name} fill className="object-cover" sizes="64px" />
                  : <div className="flex h-full items-center justify-center text-xl text-gray-300">⚡</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-600 capitalize">{v.brand}</p>
                <p className="text-sm font-bold text-gray-800 truncate">{v.name}</p>
                {v.price && <p className="text-xs text-gray-400">{v.price}</p>}
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                v.kind === 'article' ? 'bg-yellow-50 text-yellow-700'
                : v.vehicleType === 'cars' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {v.kind === 'article' ? 'News' : v.vehicleType === 'cars' ? 'Car' : 'Bike'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!busy && query && results.length === 0 && (
        <p className="mt-3 text-center text-sm text-gray-400">No results for &quot;{query}&quot;</p>
      )}
    </div>
  )
}

/* ─── Main Navbar ──────────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const [trending,     setTrending]     = useState([])

  const closeMenu = () => { setMobileOpen(false); setMobileSearch(false) }

  // Fetch 3 latest published articles for trending bar
  useEffect(() => {
    fetch('/api/articles?status=published&limit=3')
      .then(r => r.json())
      .then(data => {
        const arts = data.articles || []
        if (arts.length > 0) setTrending(arts.map(a => ({ title: a.title, slug: a.slug })))
      })
      .catch(() => {})
  }, [])

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
              {trending.length > 0 ? (
                <span className="hidden sm:inline">
                  {trending.map((a, i) => (
                    <span key={a.slug}>
                      {i > 0 && ' • '}
                      <Link href={`/news/${a.slug}`}
                        className="hover:text-green-400 transition line-clamp-1 max-w-48 inline-block align-bottom truncate">
                        {a.title.length > 30 ? a.title.slice(0, 30) + '…' : a.title}
                      </Link>
                    </span>
                  ))}
                </span>
              ) : (
                <span className="hidden sm:inline text-gray-500">Latest EV News &amp; Launches</span>
              )}
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
              height={34}
              width={129}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-3 xl:flex">
            {DESKTOP_NAV.map((item, i) => (
              <div key={i} className="group relative">
                <Link
                  href={item.link}
                  className={`flex items-center gap-1 text-[12.5px] font-semibold transition
                    ${item.title === 'Compare'
                      ? 'rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-green-700 hover:bg-green-100'
                      : item.title === 'EV Sales'
                      ? 'text-green-700 hover:text-green-800'
                      : 'text-gray-700 hover:text-green-600'
                    }`}
                >
                  {item.title === 'Compare' && <BarChart2 size={13} />}
                  {item.title === 'EV Sales' && <TrendingUp size={13} />}
                  {item.title}
                  {item.dropdown && item.title !== 'Compare' && (
                    <ChevronDown size={13} className="transition duration-300 group-hover:rotate-180" />
                  )}
                </Link>

                {item.title !== 'Compare' && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-green-600 transition-all duration-300 group-hover:w-full" />
                )}

                {item.dropdown && (
                  <div className={`invisible absolute top-9 translate-y-2 rounded-2xl border border-gray-100 bg-white p-2 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 z-50
                    ${item.title === 'EV Sales' ? 'left-0 w-64' : 'left-0 w-58'}`}>
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
          <div className="hidden items-center gap-2.5 xl:flex">
            <SearchModal />
            <DarkModeToggle />
            <Link
              href="/news"
              className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-green-700"
            >
              Latest News
            </Link>
          </div>

          {/* Mobile Right Buttons */}
          <div className="flex items-center gap-2 xl:hidden">
            <DarkModeToggle />
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

      {/* ── Mobile Drawer ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-150 xl:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMenu} />

          {/* Drawer panel */}
          <div className="absolute inset-y-0 right-0 flex w-full max-w-85 flex-col bg-white shadow-2xl">

            {/* ── Green gradient header ────────────────────────────── */}
            <div className="bg-linear-to-br from-green-900 via-green-800 to-green-700 px-5 py-5 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                    <Zap size={16} className="text-white" />
                  </div>
                  <span className="text-base font-black text-white">EV News India</span>
                </Link>
                <button onClick={closeMenu}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition">
                  <X size={17} />
                </button>
              </div>
              <p className="text-[11px] text-green-200 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                India&apos;s #1 Electric Vehicle Platform
              </p>
            </div>

            {/* ── Scrollable body ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">

              {/* Search */}
              <div className="border-b border-gray-100 py-2">
                {mobileSearch
                  ? <MobileSearch onClose={closeMenu} />
                  : (
                    <button
                      onClick={() => setMobileSearch(true)}
                      className="mx-4 my-2 flex w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 hover:border-green-400 hover:bg-white transition"
                    >
                      <Search size={15} className="shrink-0" />
                      Search EV cars, bikes, brands…
                    </button>
                  )
                }
              </div>

              {/* Quick access — 4 icon tiles */}
              <div className="px-4 py-4 border-b border-gray-100">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Access</p>
                <div className="grid grid-cols-4 gap-2">
                  {MOBILE_QUICK.map(({ label, href, icon: Icon, color }) => (
                    <Link key={label} href={href} onClick={closeMenu}
                      className={`flex flex-col items-center gap-2 rounded-2xl ${color} py-3.5 transition active:scale-95 hover:opacity-90`}>
                      <Icon size={20} />
                      <span className="text-[11px] font-bold leading-none">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Navigation links */}
              <div className="px-4 py-3">
                <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Navigation</p>
                <nav className="space-y-0.5">
                  {MOBILE_NAV.map(({ title, href, icon: Icon }) => {
                    const isCompare = href === '/compare'
                    return (
                      <Link key={href} href={href} onClick={closeMenu}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13.5px] font-semibold transition active:scale-[0.98] ${
                          isCompare ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                        }`}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                          isCompare ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-500'
                        }`}>
                          <Icon size={15} />
                        </span>
                        <span className="flex-1">{title}</span>
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-green-400 transition" />
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* ── Footer CTAs ──────────────────────────────────────── */}
            <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-4 py-4 space-y-2">
              <Link href="/compare" onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-green-600 py-3 text-sm font-bold text-green-700 hover:bg-green-50 active:scale-[0.98] transition">
                <BarChart2 size={16} /> Compare EVs
              </Link>
              <Link href="/news" onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-green-600 py-3.5 text-sm font-black text-white shadow-md hover:bg-green-700 active:scale-[0.98] transition">
                <Newspaper size={16} /> Latest EV News <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
