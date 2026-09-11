'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, ChevronDown, Search, Car, Bike, Truck,
  BarChart2, Newspaper, BookOpen, Mail, Info,
  ArrowRight, Zap, ChevronRight, TrendingUp, Flame,
  MapPin, Home, Star, Activity,
} from 'lucide-react'
import SearchModal from './SearchModal'
import DarkModeToggle from './DarkModeToggle'
import ArticleImage from '@/components/news/ArticleImage'

/* ─── Navigation data (Resources/Tools removed) ────────────────── */
const NAV = [
  { label: 'Home', href: '/' },
  {
    label: 'News', href: '/news',
    mega: [
      {
        heading: 'By Category',
        links: [
          { name: 'All EV News',        href: '/news',                     icon: Newspaper, tag: 'Latest'   },
          { name: 'Electric Cars',      href: '/news?category=cars',       icon: Car                        },
          { name: 'Electric Bikes',     href: '/news?category=bikes',      icon: Bike                       },
          { name: 'Commercial EVs',     href: '/news?category=commercial', icon: Truck                      },
          { name: 'EV Charging',        href: '/news?category=charging',   icon: Zap                        },
        ],
      },
    ],
  },
  {
    label: 'Vehicles', href: '/cars',
    mega: [
      {
        heading: 'Browse',
        links: [
          { name: 'Electric Cars',    href: '/cars',       icon: Car,      tag: 'Popular' },
          { name: 'Electric Bikes',   href: '/bikes',      icon: Bike                     },
          { name: 'Commercial EVs',   href: '/commercial', icon: Truck                    },
        ],
      },
      {
        heading: 'Explore',
        links: [
          { name: 'Compare EVs',      href: '/compare',    icon: BarChart2, tag: 'New'   },
          { name: 'Top Selling EVs',  href: '/top-selling-evs', icon: Flame             },
        ],
      },
    ],
  },
  {
    label: 'EV Sales', href: '/ev-sales',
    mega: [
      {
        heading: 'Sales Data',
        links: [
          { name: 'Sales Dashboard',     href: '/ev-sales',                 icon: Activity,  tag: 'Live' },
          { name: 'Electric Car Sales',  href: '/ev-sales/cars',            icon: Car                   },
          { name: 'Two-Wheeler Sales',   href: '/ev-sales/two-wheelers',    icon: Bike                  },
          { name: 'Commercial EV Sales', href: '/ev-sales/commercial',      icon: Truck                 },
        ],
      },
      {
        heading: 'Insights',
        links: [
          { name: 'EV Market Share',    href: '/ev-market-share',      icon: BarChart2              },
          { name: 'Top Selling EVs',    href: '/top-selling-evs',      icon: Flame,  tag: 'Hot'    },
          { name: 'State Adoption',     href: '/ev-adoption-states',   icon: MapPin                 },
        ],
      },
    ],
  },
  { label: 'Compare', href: '/compare', cta: true },
  { label: 'Blogs',   href: '/blogs'   },
  { label: 'About',   href: '/about'   },
  { label: 'Contact', href: '/contact' },
]

const MOBILE_SECTIONS = [
  { title: 'Explore', items: [
    { label: 'Home',           href: '/',             icon: Home       },
    { label: 'Latest News',    href: '/news',         icon: Newspaper  },
    { label: 'Blogs',          href: '/blogs',        icon: BookOpen   },
  ]},
  { title: 'Vehicles', items: [
    { label: 'Electric Cars',  href: '/cars',         icon: Car        },
    { label: 'Electric Bikes', href: '/bikes',        icon: Bike       },
    { label: 'Commercial EVs', href: '/commercial',   icon: Truck      },
    { label: 'Compare EVs',    href: '/compare',      icon: BarChart2, accent: true },
  ]},
  { title: 'EV Data', items: [
    { label: 'Sales Dashboard',   href: '/ev-sales',             icon: TrendingUp },
    { label: 'EV Market Share',   href: '/ev-market-share',      icon: BarChart2  },
    { label: 'Top Selling EVs',   href: '/top-selling-evs',      icon: Flame      },
    { label: 'State Adoption',    href: '/ev-adoption-states',   icon: MapPin     },
  ]},
  { title: 'Company', items: [
    { label: 'About Us',  href: '/about',   icon: Info },
    { label: 'Contact',   href: '/contact', icon: Mail },
  ]},
]

const QUICK_TILES = [
  { label: 'Cars',     href: '/cars',     icon: Car,        bg: 'bg-blue-600'   },
  { label: 'Bikes',    href: '/bikes',    icon: Bike,       bg: 'bg-orange-500' },
  { label: 'Sales',    href: '/ev-sales', icon: TrendingUp, bg: 'bg-green-600'  },
  { label: 'News',     href: '/news',     icon: Newspaper,  bg: 'bg-rose-600'   },
]

/* ─── Inline mobile search ──────────────────────────────────────── */
function MobileSearch({ onClose }) {
  const [q,   setQ]   = useState('')
  const [res, setRes] = useState([])
  const [busy, setBusy] = useState(false)
  const ref   = useRef(null)
  const timer = useRef(null)

  useEffect(() => { ref.current?.focus() }, [])

  const search = useCallback((val) => {
    clearTimeout(timer.current)
    if (!val.trim()) { setRes([]); return }
    timer.current = setTimeout(async () => {
      setBusy(true)
      try {
        const enc = encodeURIComponent(val)
        const [vR, aR] = await Promise.all([
          fetch(`/api/vehicles?search=${enc}&status=published&limit=5`).then(r => r.json()),
          fetch(`/api/articles?search=${enc}&status=published&limit=3`).then(r => r.json()),
        ])
        const vehicles = (vR.vehicles || []).map(v => ({
          kind: 'vehicle', id: v._id, slug: v.slug,
          type: v.vehicleType === 'car' ? 'cars' : 'bikes',
          name: v.name, brand: v.brand, image: v.featuredImage || '',
          price: v.variants?.[0]?.exShowroomPrice || '',
        }))
        const articles = (aR.articles || []).map(a => ({
          kind: 'article', id: a._id, slug: a.slug, type: 'news',
          name: a.title, brand: a.category || 'EV News', image: a.image || '',
        }))
        setRes([...vehicles, ...articles].slice(0, 8))
      } catch { setRes([]) }
      setBusy(false)
    }, 300)
  }, [])

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2.5 rounded-xl border-2 border-green-500/40 bg-gray-50 px-4 py-2.5 focus-within:border-green-500 focus-within:bg-white transition-all">
        <Search size={15} className="shrink-0 text-green-500" />
        <input
          ref={ref}
          value={q}
          onChange={e => { setQ(e.target.value); search(e.target.value) }}
          placeholder="Search EVs, news, brands…"
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        {q && (
          <button onClick={() => { setQ(''); setRes([]) }}
            className="rounded-full p-0.5 text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>

      {busy && (
        <div className="mt-3 flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-green-500 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      )}

      {!busy && res.length > 0 && (
        <div className="mt-2.5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {res.map(item => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.kind === 'article' ? `/news/${item.slug}` : `/${item.type}/${item.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-green-50 transition"
            >
              <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.kind === 'article'
                  ? <ArticleImage src={item.image} fallbackSrc="/images/og-default.jpg" alt={item.name} className="h-full w-full object-cover" />
                  : item.image
                    ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                    : <div className="flex h-full items-center justify-center text-gray-300"><Zap size={16} /></div>
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{item.brand}</p>
                <p className="truncate text-[13px] font-semibold text-gray-800">{item.name}</p>
                {item.price && <p className="text-[11px] text-gray-400">{item.price}</p>}
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                item.kind === 'article' ? 'bg-amber-50 text-amber-600'
                : item.type === 'cars' ? 'bg-blue-50 text-blue-600'
                : 'bg-orange-50 text-orange-600'
              }`}>
                {item.kind === 'article' ? 'News' : item.type === 'cars' ? 'Car' : 'Bike'}
              </span>
            </Link>
          ))}
        </div>
      )}
      {!busy && q && res.length === 0 && (
        <p className="mt-4 text-center text-sm text-gray-400">No results for &quot;{q}&quot;</p>
      )}
    </div>
  )
}

/* ─── Mega-menu dropdown ────────────────────────────────────────── */
function MegaMenu({ item }) {
  return (
    <div className="absolute left-1/2 top-full z-50 mt-0 -translate-x-1/2 pt-3
      opacity-0 translate-y-2 invisible pointer-events-none
      group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible group-hover:pointer-events-auto
      transition-all duration-200 ease-out">

      {/* Triangle tip */}
      <div className="mx-auto mb-0 h-2.5 w-5 overflow-hidden relative" style={{ marginLeft: 'calc(50% - 10px)' }}>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border border-gray-100 bg-white shadow-sm" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-black/10 overflow-hidden"
        style={{ minWidth: item.mega.length > 1 ? '480px' : '240px' }}>

        {/* Top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600" />

        <div className={`p-3 ${item.mega.length > 1 ? 'grid grid-cols-2 gap-1 divide-x divide-gray-50' : ''}`}>
          {item.mega.map((col, ci) => (
            <div key={ci} className={ci > 0 ? 'pl-3' : ''}>
              <p className="mb-1 px-2.5 pt-1 pb-2 text-[9px] font-black uppercase tracking-[0.12em] text-gray-400">
                {col.heading}
              </p>
              <div className="space-y-0.5">
                {col.links.map((link, li) => (
                  <Link
                    key={li}
                    href={link.href}
                    className="group/link flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-green-50"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover/link:bg-green-100 group-hover/link:text-green-600">
                      <link.icon size={13} />
                    </span>
                    <span className="flex-1 text-[13px] font-medium text-gray-700 group-hover/link:text-green-700 transition leading-snug whitespace-nowrap">
                      {link.name}
                    </span>
                    {link.tag && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black text-green-700">
                        {link.tag}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer "view all" */}
        <div className="border-t border-gray-50 bg-gray-50/80 px-5 py-2.5">
          <Link href={item.href}
            className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 hover:text-green-700 transition">
            View all {item.label} <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Desktop nav item ──────────────────────────────────────────── */
function NavItem({ item, active }) {
  const isCta = item.cta

  if (isCta) {
    return (
      <Link href={item.href}
        className="flex items-center gap-1.5 rounded-lg border-2 border-green-600 px-3.5 py-1.5 text-[12.5px] font-black text-green-700 transition hover:bg-green-600 hover:text-white active:scale-95">
        <BarChart2 size={13} />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={`relative flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all
          ${active
            ? 'text-green-700'
            : 'text-gray-600 hover:text-green-700 hover:bg-green-50/70'
          }`}
      >
        {item.label}
        {item.mega && (
          <ChevronDown size={12} className="mt-px text-gray-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-green-600" />
        )}
        {/* active indicator dot */}
        {active && (
          <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-600" />
        )}
      </Link>

      {item.mega && <MegaMenu item={item} />}
    </div>
  )
}

/* ─── Main Navbar ───────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [trending,     setTrending]     = useState([])
  const [tickerIdx,    setTickerIdx]    = useState(0)

  const closeMenu = useCallback(() => { setMobileOpen(false); setMobileSearch(false) }, [])

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* lock body when drawer open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* fetch trending articles for ticker */
  useEffect(() => {
    fetch('/api/articles?status=published&limit=5')
      .then(r => r.json())
      .then(d => { if (d.articles?.length) setTrending(d.articles.map(a => ({ title: a.title, slug: a.slug }))) })
      .catch(() => {})
  }, [])

  /* rotate ticker every 4 s */
  useEffect(() => {
    if (!trending.length) return
    const t = setInterval(() => setTickerIdx(i => (i + 1) % trending.length), 4000)
    return () => clearInterval(t)
  }, [trending])

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'shadow-lg shadow-black/8' : ''
      }`}>

        {/* ── Ticker bar ──────────────────────────────────────── */}
        <div className="bg-gray-950 text-white">
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4">

            {/* Left: label + rotating headline */}
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex shrink-0 items-center gap-1 rounded-sm bg-green-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                <Zap size={8} />LIVE
              </span>
              <div className="relative h-4 min-w-0 flex-1 overflow-hidden">
                {trending.length > 0 ? (
                  <div
                    key={tickerIdx}
                    className="animate-ticker-in whitespace-nowrap text-[11px] text-gray-300"
                  >
                    <Link href={`/news/${trending[tickerIdx]?.slug}`}
                      className="hover:text-green-400 transition">
                      {trending[tickerIdx]?.title}
                    </Link>
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-500">India&apos;s #1 Electric Vehicle News Platform</span>
                )}
              </div>
            </div>

            {/* Right: dots */}
            {trending.length > 1 && (
              <div className="flex shrink-0 items-center gap-1">
                {trending.map((_, i) => (
                  <button key={i} onClick={() => setTickerIdx(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${i === tickerIdx ? 'w-4 bg-green-500' : 'w-1 bg-white/20 hover:bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Main nav ────────────────────────────────────────── */}
        <div className={`border-b transition-all duration-300 ${
          scrolled
            ? 'border-gray-200/60 bg-white/95 backdrop-blur-2xl'
            : 'border-gray-100 bg-white'
        }`}>
          <nav className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4">

            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image
                src="/images/logo.png"
                alt="EVRadar — India's #1 EV News"
                width={118}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden items-center gap-0.5 xl:flex">
              {NAV.map((item, i) => (
                <NavItem key={i} item={item} />
              ))}
            </div>

            {/* Desktop right */}
            <div className="hidden items-center gap-2 xl:flex">
              <SearchModal />
              <DarkModeToggle />
              <Link
                href="/news"
                className="group flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-[13px] font-black text-white shadow-md shadow-green-600/20 transition hover:bg-green-700 hover:shadow-green-600/30 active:scale-95"
              >
                <Flame size={13} className="transition group-hover:scale-110" />
                Latest News
              </Link>
            </div>

            {/* Mobile right */}
            <div className="flex items-center gap-2 xl:hidden">
              <DarkModeToggle />
              <button
                onClick={() => { setMobileSearch(s => !s); if (!mobileOpen) setMobileOpen(true) }}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 transition"
              >
                <Search size={17} />
              </button>
              <button
                onClick={() => { setMobileOpen(o => !o); setMobileSearch(false) }}
                aria-label="Menu"
                className={`relative flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-xl transition ${
                  mobileOpen ? 'bg-gray-900' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className={`block h-[1.5px] w-5 origin-center rounded-full transition-all duration-300 ${mobileOpen ? 'translate-y-[4.5px] rotate-45 bg-white' : 'bg-gray-700'}`} />
                <span className={`block h-[1.5px] rounded-full transition-all duration-300 ${mobileOpen ? 'w-0 opacity-0 bg-white' : 'w-5 bg-gray-700'}`} />
                <span className={`block h-[1.5px] w-5 origin-center rounded-full transition-all duration-300 ${mobileOpen ? '-translate-y-[4.5px] -rotate-45 bg-white' : 'bg-gray-700'}`} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div className={`fixed inset-y-0 right-0 z-[150] flex w-full max-w-[340px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out xl:hidden ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>

        {/* ── Drawer header ─────────────────────────────────── */}
        <div className="relative shrink-0 overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-green-950 to-gray-900" />
          {/* decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-500/10" />
          <div className="absolute right-4 top-16 h-20 w-20 rounded-full bg-green-500/10" />

          <div className="relative px-5 pt-5 pb-6">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-600 shadow-lg shadow-green-900/40">
                  <Zap size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-white">EV News India</p>
                  <p className="text-[10px] text-green-400">evradar.in</p>
                </div>
              </Link>
              <button onClick={closeMenu} aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition">
                <X size={15} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[11px] text-gray-400">India&apos;s #1 Electric Vehicle Platform</p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-50">

          {/* Search */}
          <div className="bg-white border-b border-gray-100 px-4 py-3">
            {mobileSearch
              ? <MobileSearch onClose={closeMenu} />
              : (
                <button onClick={() => setMobileSearch(true)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-gray-400 hover:border-green-400 hover:bg-white transition">
                  <Search size={14} className="text-gray-400" />
                  Search cars, bikes, news…
                </button>
              )
            }
          </div>

          {/* Quick tiles */}
          <div className="bg-white border-b border-gray-100 px-4 py-4">
            <p className="mb-3 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">Quick Access</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_TILES.map(({ label, href, icon: Icon, bg }) => (
                <Link key={label} href={href} onClick={closeMenu}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl ${bg} py-4 text-white shadow-sm active:scale-95 transition`}>
                  <Icon size={18} />
                  <span className="text-[10px] font-black leading-none">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sectioned links */}
          <div className="space-y-3 p-4">
            {MOBILE_SECTIONS.map(({ title, items }) => (
              <div key={title}>
                <p className="mb-1.5 px-1 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">{title}</p>
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                  {items.map(({ label, href, icon: Icon, accent }, idx) => (
                    <Link key={href} href={href} onClick={closeMenu}
                      className={`group flex items-center gap-3 px-4 py-3.5 transition active:scale-[0.98] ${
                        idx < items.length - 1 ? 'border-b border-gray-50' : ''
                      } ${accent
                        ? 'bg-green-50 hover:bg-green-100 text-green-700'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-green-700'
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                        accent
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600'
                      }`}>
                        <Icon size={14} />
                      </span>
                      <span className="flex-1 text-[13.5px] font-semibold">{label}</span>
                      {accent
                        ? <Star size={11} className="text-green-500 fill-green-500" />
                        : <ChevronRight size={13} className="text-gray-300 group-hover:text-green-400 transition" />
                      }
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Drawer footer CTAs ────────────────────────────── */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4">
          <div className="grid grid-cols-2 gap-2.5">
            <Link href="/compare" onClick={closeMenu}
              className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-green-600 py-3 text-[12.5px] font-black text-green-700 hover:bg-green-50 active:scale-95 transition">
              <BarChart2 size={14} /> Compare
            </Link>
            <Link href="/news" onClick={closeMenu}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-green-600 py-3 text-[12.5px] font-black text-white shadow-lg shadow-green-600/25 hover:bg-green-700 active:scale-95 transition">
              <Flame size={14} /> Latest News
            </Link>
          </div>
        </div>
      </div>

    </>
  )
}
