'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { BatteryCharging, Gauge, Zap, ArrowRight, TrendingUp } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

/* ─── Desktop Slides ──────────────────────────────────────────────────── */
const slides = [
  {
    tag: '🚗 Electric Cars',
    title: 'Find Your Perfect Electric Car',
    description: 'Compare price, range & specs for the top EVs in India. Real reviews, real prices.',
    cta: { label: 'Browse Electric Cars', href: '/cars' },
    secondary: { label: 'Compare Models', href: '/compare' },
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop',
    badge: 'Tata Nexon EV · ₹14.49 Lakh',
  },
  {
    tag: '⚡ Latest Launches',
    title: 'Mahindra BE 6 is Here',
    description: '682 km range · 228 bhp · Starting ₹18.90 Lakh. India\'s most awaited electric SUV.',
    cta: { label: 'See Full Specs', href: '/cars/mahindra-be6' },
    secondary: { label: 'All EV News', href: '/news' },
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1600&auto=format&fit=crop',
    badge: 'New Launch 2026',
  },
  {
    tag: '🛵 Electric Bikes',
    title: 'Top Electric Scooters Compared',
    description: 'Ather 450X, Ola S1 Pro, TVS iQube — specs, range & prices in one place.',
    cta: { label: 'Browse Electric Bikes', href: '/bikes' },
    secondary: { label: 'Compare Bikes', href: '/compare' },
    image: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?q=80&w=1600&auto=format&fit=crop',
    badge: 'From ₹1.10 Lakh',
  },
]

/* ─── Mobile Featured Cards ───────────────────────────────────────────── */
const mobileFeatures = [
  { label: '50+ EV Models', icon: <BatteryCharging size={18} className="text-green-400" />, sub: 'Cars & Bikes' },
  { label: 'Live Prices', icon: <TrendingUp size={18} className="text-blue-400" />, sub: 'Updated Daily' },
  { label: 'Top Speed', icon: <Gauge size={18} className="text-purple-400" />, sub: 'Spec Sheets' },
  { label: 'Range Data', icon: <Zap size={18} className="text-yellow-400" />, sub: 'Real World' },
]

const mobileSlides = [
  {
    label: 'Best Seller',
    name: 'Tata Nexon EV',
    price: '₹14.49 Lakh',
    range: '465–489 km',
    href: '/cars/tata-nexon-ev',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
    type: 'car',
  },
  {
    label: 'Trending',
    name: 'Mahindra BE 6',
    price: '₹18.90 Lakh',
    range: '682 km',
    href: '/cars/mahindra-be6',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=800&auto=format&fit=crop',
    type: 'car',
  },
  {
    label: "Editor's Choice",
    name: 'Ather 450X Gen 4',
    price: '₹1.50 Lakh',
    range: '111–146 km',
    href: '/bikes/ather-450x',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
    type: 'bike',
  },
]

/* ─── Desktop Hero ────────────────────────────────────────────────────── */
function DesktopHero() {
  return (
    <section className="hidden md:block w-full bg-[#0B1120]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop
        className="h-120 lg:h-150"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-8">
                  <div className="max-w-xl">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/20 px-4 py-1.5 text-sm font-semibold text-green-300 backdrop-blur-sm">
                      {slide.tag}
                    </span>
                    {slide.badge && (
                      <span className="ml-3 inline-flex items-center rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-black">
                        {slide.badge}
                      </span>
                    )}

                    <h1 className="mt-4 text-4xl font-black leading-tight text-white lg:text-5xl">
                      {slide.title}
                    </h1>

                    <p className="mt-4 text-base leading-relaxed text-gray-300 lg:text-lg">
                      {slide.description}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href={slide.cta.href}
                        className="flex items-center gap-2 rounded-full bg-[#00a651] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#009245] hover:scale-105"
                      >
                        {slide.cta.label} <ArrowRight size={16} />
                      </Link>
                      <Link
                        href={slide.secondary.href}
                        className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                      >
                        {slide.secondary.label}
                      </Link>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-8 flex gap-6">
                      {[
                        { label: '50+ Models', sub: 'Listed' },
                        { label: '10K+ Reviews', sub: 'Verified' },
                        { label: 'Live Prices', sub: 'Updated' },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="text-base font-black text-white">{stat.label}</p>
                          <p className="text-xs text-gray-400">{stat.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

/* ─── Mobile Hero ─────────────────────────────────────────────────────── */
function MobileHero() {
  return (
    <section className="md:hidden w-full bg-linear-to-b from-[#0B1120] via-[#0f1e15] to-[#0B1120]">
      {/* Top Bar */}
      <div className="px-4 pt-5 pb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
          ⚡ EV NEWS INDIA — #1 Platform
        </span>
        <h1 className="mt-3 text-2xl font-black leading-tight text-white">
          India&apos;s Best<br />Electric Vehicles
        </h1>
        <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
          Compare prices, specs &amp; range for top EVs in India.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-2.5 px-4 pb-4">
        <Link
          href="/cars"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#00a651] py-3 text-sm font-bold text-white transition hover:bg-[#009245]"
        >
          🚗 Browse Cars
        </Link>
        <Link
          href="/bikes"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          🛵 Browse Bikes
        </Link>
      </div>

      {/* Stats Row */}
      <div className="mx-4 mb-4 grid grid-cols-4 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {mobileFeatures.map((f) => (
          <div key={f.label} className="flex flex-col items-center py-3 px-1 gap-1">
            {f.icon}
            <p className="text-[11px] font-bold text-white text-center leading-tight">{f.label}</p>
            <p className="text-[9px] text-gray-500 text-center">{f.sub}</p>
          </div>
        ))}
      </div>

      {/* Featured Vehicle Cards (horizontal scroll) */}
      <div className="pb-5">
        <p className="px-4 mb-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
          Featured Vehicles
        </p>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory">
          {mobileSlides.map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="shrink-0 w-48 snap-start overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <div className="relative h-28 w-full overflow-hidden">
                <Image
                  src={v.image}
                  alt={v.name}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
                <span className="absolute top-2 left-2 rounded-full bg-[#00a651] px-2 py-0.5 text-[10px] font-bold text-white">
                  {v.label}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-black text-white leading-tight">{v.name}</p>
                <p className="mt-0.5 text-xs font-bold text-[#00a651]">{v.price}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <BatteryCharging size={11} className="text-gray-400" />
                  <p className="text-[10px] text-gray-400">{v.range}</p>
                </div>
              </div>
            </Link>
          ))}

          {/* Compare CTA Card */}
          <Link
            href="/compare"
            className="shrink-0 w-40 snap-start flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-green-500/30 bg-green-500/10 p-4 text-center"
          >
            <span className="text-2xl">⚖️</span>
            <p className="text-xs font-bold text-green-400 leading-tight">Compare<br />Vehicles</p>
            <span className="text-[10px] text-gray-500">Side by side</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Combined Export ─────────────────────────────────────────────────── */
export default function HeroSwiper() {
  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  )
}
