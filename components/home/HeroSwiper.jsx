'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import {
  Search, Car, Bike, BarChart2, Zap,
  Truck, BatteryCharging, ChevronRight, Newspaper, Building2,
} from 'lucide-react'

import 'swiper/css'
import 'swiper/css/pagination'

/* ─── Fallback slides (shown until API banners load) ─────────────── */
const SLIDES = [
  {
    image:    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1600&auto=format&fit=crop',
    tag:      '⚡ EV News India',
    tagColor: 'bg-green-600',
    title:    "India's #1 Electric Vehicle News Platform",
    subtitle: 'Latest EV prices, reviews, launches and subsidies — all in one place.',
    cta:      { label: 'Explore EVs', href: '/electric-vehicles' },
  },
  {
    image:    'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop',
    tag:      '🚗 Electric Cars',
    tagColor: 'bg-blue-600',
    title:    'Compare All Electric Cars in India 2026',
    subtitle: 'Filter by price, range and battery. Find your perfect EV.',
    cta:      { label: 'Browse Cars', href: '/cars' },
  },
  {
    image:    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1600&auto=format&fit=crop',
    tag:      '🛵 Electric Bikes',
    tagColor: 'bg-orange-500',
    title:    'Top Electric Scooters & Bikes in India',
    subtitle: 'Ola, Ather, TVS, Bajaj and more — compare range, price and specs.',
    cta:      { label: 'Browse Bikes', href: '/bikes' },
  },
]

const MOBILE_SLIDES = [
  {
    image:    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop',
    tag:      '⚡ EV News',
    tagColor: 'bg-green-600',
    title:    "India's #1 EV News Platform",
    subtitle: 'Latest launches, prices & reviews.',
    cta:      { label: 'Explore', href: '/electric-vehicles' },
  },
  {
    image:    'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
    tag:      '🚗 Electric Cars',
    tagColor: 'bg-blue-600',
    title:    'Compare Electric Cars 2026',
    subtitle: 'All EVs, all prices, one place.',
    cta:      { label: 'Browse Cars', href: '/cars' },
  },
  {
    image:    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
    tag:      '🛵 Electric Bikes',
    tagColor: 'bg-orange-500',
    title:    'Top Electric Bikes in India',
    subtitle: 'Ola, Ather, TVS and more.',
    cta:      { label: 'Browse Bikes', href: '/bikes' },
  },
]


const QUICK_LINKS = [
  { label: 'New Cars',      href: '/cars',              Icon: Car,             color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { label: 'Electric Bikes',href: '/bikes',             Icon: Bike,            color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { label: 'Compare EVs',   href: '/compare',           Icon: BarChart2,       color: 'text-green-700 bg-green-50 border-green-100' },
  { label: 'EV Charging',   href: '/electric-vehicles', Icon: BatteryCharging, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { label: 'Commercial',    href: '/commercial',        Icon: Truck,           color: 'text-red-600 bg-red-50 border-red-100' },
  { label: 'EV News',       href: '/news',              Icon: Zap,             color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
  { label: 'Brands',        href: '/brands',            Icon: Building2,       color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
]

/* Budget keys — hrefs are built dynamically based on active vehicleType tab */
const BUDGET_KEYS = [
  { label: 'Under ₹5L',   key: 'under5l'  },
  { label: '₹5–15 Lakh',  key: '5-15l'    },
  { label: '₹15–30 Lakh', key: '15-30l'   },
  { label: '₹30–50 Lakh', key: '30-50l'   },
  { label: 'Above ₹50L',  key: 'above50l' },
]

/* Brand → filters by brand name; styled initial badge (no external logo URLs) */
const BRANDS = [
  { name: 'Tata',     type: 'car',  initial: 'T',   bg: '#00356b', text: '#fff'     },
  { name: 'Mahindra', type: 'car',  initial: 'M',   bg: '#c00000', text: '#fff'     },
  { name: 'Ather',    type: 'bike', initial: 'A',   bg: '#1a1a2e', text: '#00e5ff'  },
  { name: 'Ola EV',   type: 'bike', initial: 'O',   bg: '#00b0ff', text: '#fff'     },
  { name: 'BYD',      type: 'car',  initial: 'B',   bg: '#1e3f6f', text: '#fff'     },
  { name: 'MG',       type: 'car',  initial: 'MG',  bg: '#c00000', text: '#fff'     },
  { name: 'Hyundai',  type: 'car',  initial: 'H',   bg: '#002c5f', text: '#fff'     },
  { name: 'TVS',      type: 'bike', initial: 'TVS', bg: '#e31837', text: '#fff'     },
]

function brandHref(b) {
  return `/${b.type === 'car' ? 'cars' : 'bikes'}?brand=${encodeURIComponent(b.name)}`
}

/* ─── Brand Logo (styled initial badge) ─────────────────────────── */
function BrandLogo({ brand, size = 28 }) {
  return (
    <span
      className="flex items-center justify-center rounded-full font-black"
      style={{
        width: size, height: size,
        background: brand.bg, color: brand.text,
        fontSize: size <= 28 ? 10 : 13,
      }}
    >
      {brand.initial}
    </span>
  )
}

/* ─── Search with live suggestions ──────────────────────────────── */
function SearchBar({ vehicleType, setVehicleType, mobile = false, onQueryChange }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug]         = useState(false)
  const [busy, setBusy]               = useState(false)
  const timerRef  = useRef(null)
  const wrapRef   = useRef(null)

  /* close dropdown on outside click */
  useEffect(() => {
    function onOut(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSug(false)
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  const fetchSuggestions = useCallback((val) => {
    clearTimeout(timerRef.current)
    if (!val.trim()) { setSuggestions([]); setShowSug(false); return }
    timerRef.current = setTimeout(async () => {
      setBusy(true)
      try {
        const enc = encodeURIComponent(val)
        const [vRes, aRes] = await Promise.all([
          fetch(`/api/vehicles?search=${enc}&status=published&limit=5`).then(r => r.json()),
          fetch(`/api/articles?search=${enc}&status=published&limit=3`).then(r => r.json()),
        ])
        const vItems = (vRes.vehicles || []).map(v => ({
          kind:  'vehicle',
          label: v.name,
          sub:   v.brand,
          href:  `/${v.vehicleType === 'car' ? 'cars' : 'bikes'}/${v.slug}`,
        }))
        const aItems = (aRes.articles || []).map(a => ({
          kind:  'article',
          label: a.title,
          sub:   a.category,
          href:  `/news/${a.slug}`,
        }))
        const combined = [...vItems, ...aItems]
        setSuggestions(combined)
        setShowSug(combined.length > 0)
      } catch { /* silent */ }
      setBusy(false)
    }, 320)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    onQueryChange?.(val)
    fetchSuggestions(val)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/${vehicleType}?search=${encodeURIComponent(query.trim())}`
    }
  }

  const inputClass = mobile
    ? 'flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400'
    : 'flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 py-2'

  return (
    <div ref={wrapRef} className={mobile ? 'flex gap-2 relative' : 'flex flex-1 items-center gap-2 px-2 relative'}>
      {!mobile && <Search size={17} className="text-gray-400 shrink-0" />}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSug(true)}
          placeholder={vehicleType === 'cars'
            ? 'Search car brand, model or news…'
            : 'Search bike brand, model or news…'}
          className={inputClass}
          autoComplete="off"
        />
        {mobile && (
          <button
            type="submit"
            className="flex items-center justify-center rounded-xl bg-[#00a651] px-4 py-2.5 text-white hover:bg-[#009245] transition shrink-0"
          >
            <Search size={16} />
          </button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSug && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {busy && (
            <div className="px-4 py-2 text-xs text-gray-400">Searching…</div>
          )}
          {!busy && suggestions.map((s, i) => (
            <Link
              key={i}
              href={s.href}
              onClick={() => setShowSug(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                s.kind === 'vehicle' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                {s.kind === 'vehicle'
                  ? <Car size={14} className="text-green-600" />
                  : <Newspaper size={14} className="text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400 capitalize">{s.sub}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Desktop Hero ────────────────────────────────────────────────── */
function DesktopHero({ slides }) {
  const [vehicleType, setVehicleType] = useState('cars')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="hidden md:block bg-white">

      {/* Banner Slider */}
      <div className="relative">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-105 lg:h-125"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full w-full overflow-hidden">
                <Image src={slide.image} alt={slide.title} fill priority={i === 0}
                  className="object-cover" sizes="100vw" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Search bar overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-7 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl shadow-black/20 p-2 flex items-center gap-2">
            {/* Vehicle type toggle */}
            <div className="flex rounded-xl overflow-hidden shrink-0 border border-gray-200">
              <button
                onClick={() => setVehicleType('cars')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition ${
                  vehicleType === 'cars' ? 'bg-[#00a651] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Car size={14} /> Cars
              </button>
              <button
                onClick={() => setVehicleType('bikes')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition ${
                  vehicleType === 'bikes' ? 'bg-[#00a651] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bike size={14} /> Bikes
              </button>
            </div>
            <div className="w-px h-8 bg-gray-200 shrink-0" />

            {/* Live search */}
            <SearchBar vehicleType={vehicleType} setVehicleType={setVehicleType} onQueryChange={setSearchQuery} />

            {/* Search CTA */}
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  window.location.href = `/${vehicleType}?search=${encodeURIComponent(searchQuery.trim())}`
                } else {
                  window.location.href = `/${vehicleType}`
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-[#00a651] px-6 py-3 text-sm font-black text-white hover:bg-[#009245] transition shrink-0"
            >
              <Search size={15} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links row */}
      {/* <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-6">
            {QUICK_LINKS.map(({ label, href, Icon, color }) => (
              <Link key={label} href={href}
                className="group flex flex-col items-center gap-2.5 py-5 px-2 border-r border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <div className={`w-12 h-12 rounded-2xl border ${color} flex items-center justify-center transition group-hover:scale-110`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-[#00a651] text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div> */}

      {/* Budget + Brand filter bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-6">
          {/* Budget — links change with vehicleType tab */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest shrink-0">
              By Budget:
            </span>
            {BUDGET_KEYS.map((b) => (
              <Link key={b.key} href={`/${vehicleType}?budget=${b.key}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#00a651] hover:text-[#00a651] transition">
                {b.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block w-px h-5 bg-gray-300 shrink-0" />

          {/* Brands — filtered to match active vehicleType tab */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest shrink-0">
              Brands:
            </span>
            {BRANDS.filter(b => b.type === (vehicleType === 'cars' ? 'car' : 'bike')).map((b) => (
              <Link key={b.name} href={brandHref(b)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#00a651] hover:text-[#00a651] transition">
                <BrandLogo brand={b} size={20} />
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mobile Hero ─────────────────────────────────────────────────── */
function MobileHero({ mobileSlides }) {
  const [vehicleType, setVehicleType] = useState('cars')

  return (
    <div className="md:hidden bg-white">

      {/* Full-screen mobile banner swiper */}
      <div className="relative">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-72 sm:h-80"
        >
          {mobileSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full w-full overflow-hidden">
                <Image src={slide.image} alt={slide.title} fill priority={i === 0}
                  className="object-cover" sizes="100vw" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Search bar */}
      <div className="bg-white shadow-md px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-3">
          <button onClick={() => setVehicleType('cars')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition ${
              vehicleType === 'cars' ? 'bg-[#00a651] text-white' : 'bg-white text-gray-600'
            }`}>
            <Car size={14} /> Cars
          </button>
          <button onClick={() => setVehicleType('bikes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition ${
              vehicleType === 'bikes' ? 'bg-[#00a651] text-white' : 'bg-white text-gray-600'
            }`}>
            <Bike size={14} /> Bikes
          </button>
        </div>

        <div className="flex gap-2 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-[#00a651] focus-within:bg-white transition">
          <Search size={15} className="text-gray-400 shrink-0" />
          <SearchBar vehicleType={vehicleType} setVehicleType={setVehicleType} mobile />
        </div>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 bg-gray-50 border-b border-gray-100">
        {QUICK_LINKS.map(({ label, href, Icon, color }) => (
          <Link key={label} href={href}
            className="flex flex-col items-center gap-2 py-4 sm:py-5 bg-white border-r border-b sm:border-b-0 border-gray-100 last:border-r-0 hover:bg-gray-50 transition">
            <div className={`w-10 h-10 rounded-xl border ${color} flex items-center justify-center`}>
              <Icon size={17} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Budget filter — links follow vehicleType tab */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Browse by Budget · <span className="text-green-600 capitalize">{vehicleType}</span>
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {BUDGET_KEYS.map((b) => (
            <Link key={b.key} href={`/${vehicleType}?budget=${b.key}`}
              className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#00a651] hover:text-[#00a651] transition">
              {b.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Brands — filtered to match active vehicleType tab */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Popular Brands</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {BRANDS.filter(b => b.type === (vehicleType === 'cars' ? 'car' : 'bike')).map((b) => (
            <Link key={b.name} href={brandHref(b)}
              className="shrink-0 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#00a651] hover:text-[#00a651] transition">
              <BrandLogo brand={b} size={18} />
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Banner mapper ───────────────────────────────────────────────── */
function mapBanner(b) {
  return {
    image:    b.image,
    tag:      b.tag,
    tagColor: b.tagColor || 'bg-green-500',
    title:    b.title,
    subtitle: b.subtitle,
    cta:      { label: b.ctaLabel || 'Explore', href: b.ctaHref || '/' },
  }
}

/* ─── Export ──────────────────────────────────────────────────────── */
export default function HeroSwiper() {
  const [desktopSlides, setDesktopSlides] = useState(SLIDES)
  const [mobileSlides,  setMobileSlides]  = useState(MOBILE_SLIDES)

  useEffect(() => {
    fetch('/api/banners?status=active&platform=desktop')
      .then(r => r.json())
      .then(data => { if ((data.banners || []).length > 0) setDesktopSlides(data.banners.map(mapBanner)) })
      .catch(() => {})

    fetch('/api/banners?status=active&platform=mobile')
      .then(r => r.json())
      .then(data => { if ((data.banners || []).length > 0) setMobileSlides(data.banners.map(mapBanner)) })
      .catch(() => {})
  }, [])

  return (
    <>
      <MobileHero mobileSlides={mobileSlides} />
      <DesktopHero slides={desktopSlides} />
    </>
  )
}
