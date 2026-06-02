'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import {
  Search, Car, Bike, BarChart2, Zap,
  Truck, BatteryCharging, ChevronRight,
} from 'lucide-react'

import 'swiper/css'
import 'swiper/css/pagination'

/* ─── Static fallback slides — desktop ───────────────────────────── */
const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop',
    tag: 'Best Seller 2026',
    tagColor: 'bg-green-500',
    title: "India's #1 Electric Vehicle Platform",
    subtitle: 'Compare 50+ EV Cars & Bikes · Real Prices · Expert Reviews',
    cta: { label: 'Explore Cars', href: '/cars' },
  },
  {
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1600&auto=format&fit=crop',
    tag: 'New Launch',
    tagColor: 'bg-blue-500',
    title: 'Mahindra BE 6 — 682 km Range',
    subtitle: "India's most powerful electric SUV. Starting ₹18.90 Lakh.",
    cta: { label: 'View Details', href: '/cars/mahindra-be6' },
  },
  {
    image: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=1600&auto=format&fit=crop',
    tag: "Editor's Pick",
    tagColor: 'bg-purple-500',
    title: 'Best Electric Scooters of 2026',
    subtitle: 'Ather, Ola, TVS — compare range, price & features in seconds.',
    cta: { label: 'Browse Bikes', href: '/bikes' },
  },
]

/* ─── Static fallback slides — mobile ────────────────────────────── */
const MOBILE_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
    tag: 'Best Seller 2026',
    tagColor: 'bg-green-500',
    title: "Find Your Perfect Electric Vehicle",
    subtitle: '50+ EV models · Live prices · Expert reviews',
    cta: { label: 'Explore Cars', href: '/cars' },
  },
  {
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=800&auto=format&fit=crop',
    tag: 'New Launch',
    tagColor: 'bg-blue-500',
    title: 'Mahindra BE 6 — 682 km Range',
    subtitle: 'Starting ₹18.90 Lakh.',
    cta: { label: 'View Details', href: '/cars/mahindra-be6' },
  },
  {
    image: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=800&auto=format&fit=crop',
    tag: "Editor's Pick",
    tagColor: 'bg-purple-500',
    title: 'Best Electric Scooters of 2026',
    subtitle: 'Ather, Ola, TVS — compare now.',
    cta: { label: 'Browse Bikes', href: '/bikes' },
  },
]

const QUICK_LINKS = [
  { label: 'New Cars', href: '/cars', Icon: Car, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { label: 'Electric Bikes', href: '/bikes', Icon: Bike, color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { label: 'Compare EVs', href: '/compare', Icon: BarChart2, color: 'text-green-700 bg-green-50 border-green-100' },
  { label: 'EV Charging', href: '/electric-vehicles', Icon: BatteryCharging, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { label: 'Commercial', href: '/commercial', Icon: Truck, color: 'text-red-600 bg-red-50 border-red-100' },
  { label: 'EV News', href: '/news', Icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
]

const BUDGETS = [
  { label: 'Under ₹5L', href: '/bikes' },
  { label: '₹5–15 Lakh', href: '/cars' },
  { label: '₹15–30 Lakh', href: '/cars' },
  { label: '₹30–50 Lakh', href: '/cars' },
  { label: 'Above ₹50L', href: '/cars' },
]

const BRANDS = [
  { name: 'Tata', href: '/cars', emoji: '🚗' },
  { name: 'Mahindra', href: '/cars', emoji: '🚙' },
  { name: 'Ather', href: '/bikes', emoji: '⚡' },
  { name: 'Ola EV', href: '/bikes', emoji: '🛵' },
  { name: 'BYD', href: '/cars', emoji: '🔋' },
  { name: 'MG', href: '/cars', emoji: '🌟' },
  { name: 'Hyundai', href: '/cars', emoji: '🚀' },
  { name: 'TVS', href: '/bikes', emoji: '🏍️' },
]

/* ─── Desktop Hero ────────────────────────────────────────────────── */
function DesktopHero({ slides }) {
  const [vehicleType, setVehicleType] = useState('cars')

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
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/20" />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                {/* Slide content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                    <span className={`inline-block rounded-full ${slide.tagColor} px-4 py-1 text-xs font-black text-white mb-4 shadow`}>
                      {slide.tag}
                    </span>
                    <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight max-w-2xl">
                      {slide.title}
                    </h1>
                    <p className="mt-3 text-base lg:text-lg text-white/70 max-w-xl">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.cta.href}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#00a651] px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-[#009245] hover:scale-105 transition-all"
                    >
                      {slide.cta.label} <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Search bar — overlaid at the bottom center of the banner */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-7 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl shadow-black/20 p-2 flex items-center gap-2">
            {/* Vehicle type toggle */}
            <div className="flex rounded-xl overflow-hidden shrink-0 border border-gray-200">
              <button
                onClick={() => setVehicleType('cars')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition ${
                  vehicleType === 'cars'
                    ? 'bg-[#00a651] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Car size={14} /> Cars
              </button>
              <button
                onClick={() => setVehicleType('bikes')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition ${
                  vehicleType === 'bikes'
                    ? 'bg-[#00a651] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bike size={14} /> Bikes
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 shrink-0" />

            {/* Search input */}
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search size={17} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={vehicleType === 'cars' ? 'Search by car brand, model or budget…' : 'Search by bike brand or model…'}
                className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 py-2"
              />
            </div>

            {/* Search CTA */}
            <Link
              href={`/${vehicleType}`}
              className="flex items-center gap-2 rounded-xl bg-[#00a651] px-6 py-3 text-sm font-black text-white hover:bg-[#009245] transition shrink-0"
            >
              <Search size={15} /> Search
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links row */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-6">
            {QUICK_LINKS.map(({ label, href, Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center gap-2.5 py-5 px-2 border-r border-gray-100 last:border-0 hover:bg-gray-50 transition"
              >
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
      </div>

      {/* Budget + Brand filter bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-6">
          {/* Budget */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest shrink-0">
              By Budget:
            </span>
            {BUDGETS.map((b) => (
              <Link
                key={b.label}
                href={b.href}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#00a651] hover:text-[#00a651] transition"
              >
                {b.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block w-px h-5 bg-gray-300 shrink-0" />

          {/* Brands */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest shrink-0">
              Brands:
            </span>
            {BRANDS.map((b) => (
              <Link
                key={b.name}
                href={b.href}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#00a651] hover:text-[#00a651] transition"
              >
                <span>{b.emoji}</span> {b.name}
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
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                {/* Gradient — strong bottom fade for text legibility */}
                <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/40 to-black/85" />

                {/* Slide content — centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-end px-5 pb-12 text-center">
                  {slide.tag && (
                    <span className={`mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-black text-white shadow ${slide.tagColor}`}>
                      {slide.tag}
                    </span>
                  )}
                  <h2 className="text-xl font-black leading-tight text-white sm:text-2xl">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-1.5 text-xs text-white/70 max-w-xs">{slide.subtitle}</p>
                  )}
                  <Link
                    href={slide.cta.href}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#00a651] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-green-900/30 hover:bg-[#009245] active:scale-95 transition-all"
                  >
                    {slide.cta.label} <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Search bar */}
      <div className="bg-white shadow-md px-4 pt-4 pb-3 border-b border-gray-100">
        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-3">
          <button
            onClick={() => setVehicleType('cars')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition ${
              vehicleType === 'cars' ? 'bg-[#00a651] text-white' : 'bg-white text-gray-600'
            }`}
          >
            <Car size={14} /> Cars
          </button>
          <button
            onClick={() => setVehicleType('bikes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition ${
              vehicleType === 'bikes' ? 'bg-[#00a651] text-white' : 'bg-white text-gray-600'
            }`}
          >
            <Bike size={14} /> Bikes
          </button>
        </div>

        {/* Input + button */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-[#00a651] focus-within:bg-white transition">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={vehicleType === 'cars' ? 'Search car model or brand…' : 'Search bike model or brand…'}
              className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>
          <Link
            href={`/${vehicleType}`}
            className="flex items-center justify-center rounded-xl bg-[#00a651] px-4 text-white hover:bg-[#009245] transition shrink-0"
          >
            <Search size={16} />
          </Link>
        </div>
      </div>

      {/* Quick links grid — 3 columns */}
      <div className="grid grid-cols-3 sm:grid-cols-6 bg-gray-50 border-b border-gray-100">
        {QUICK_LINKS.map(({ label, href, Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-2 py-4 sm:py-5 bg-white border-r border-b sm:border-b-0 border-gray-100 last:border-r-0 hover:bg-gray-50 transition"
          >
            <div className={`w-10 h-10 rounded-xl border ${color} flex items-center justify-center`}>
              <Icon size={17} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Budget filter — horizontal scroll */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Browse by Budget</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {BUDGETS.map((b) => (
            <Link
              key={b.label}
              href={b.href}
              className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#00a651] hover:text-[#00a651] transition"
            >
              {b.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Brands — horizontal scroll */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Popular Brands</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              className="shrink-0 flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#00a651] hover:text-[#00a651] transition"
            >
              <span>{b.emoji}</span>{b.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Shared banner mapper ────────────────────────────────────────── */
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

/* ─── Export — fetches desktop & mobile banners separately ───────── */
export default function HeroSwiper() {
  const [desktopSlides, setDesktopSlides] = useState(SLIDES)
  const [mobileSlides,  setMobileSlides]  = useState(MOBILE_SLIDES)

  useEffect(() => {
    // Desktop banners
    fetch('/api/banners?status=active&platform=desktop')
      .then((r) => r.json())
      .then((data) => {
        const banners = data.banners || []
        if (banners.length > 0) setDesktopSlides(banners.map(mapBanner))
      })
      .catch(() => {})

    // Mobile banners — fetched independently
    fetch('/api/banners?status=active&platform=mobile')
      .then((r) => r.json())
      .then((data) => {
        const banners = data.banners || []
        if (banners.length > 0) setMobileSlides(banners.map(mapBanner))
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <MobileHero mobileSlides={mobileSlides} />
      <DesktopHero slides={desktopSlides} />
    </>
  )
}
