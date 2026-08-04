"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { BatteryCharging, Zap, Gauge, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { VehicleSliderSkeleton } from "@/components/skeletons/Skeletons";

import "swiper/css";

const TAG_COLORS = {
  "Featured":    "bg-green-600 text-white",
  "Coming Soon": "bg-amber-500 text-white",
  "Popular":     "bg-blue-600 text-white",
};

function fmtPrice(price, priceMax) {
  if (!price || price === "Price TBA") return "Price TBA";
  if (priceMax && priceMax !== price) return `${price} – ${priceMax}`;
  return price;
}

export default function VehicleSlider({
  title,
  subtitle,
  vehicles = [],
  vehicleType = "cars",
}) {
  const [swiper, setSwiper] = useState(null);
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    // Lazy-load GSAP so it's excluded from the critical homepage bundle (~80 KB saved)
    let ctx;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.from(headerRef.current, {
            opacity: 0, y: 24, duration: 0.6, ease: "power3.out",
            immediateRender: false,
            scrollTrigger: { trigger: headerRef.current, start: "top 90%", once: true },
          });
          gsap.from(".vs-slide", {
            opacity: 0, y: 32, stagger: 0.08, duration: 0.5, ease: "power2.out",
            immediateRender: false,
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
          });
        }, sectionRef.current);
      }
    );
    return () => ctx?.revert();
  }, []);

  if (!vehicles.length) return null;

  return (
    <section ref={sectionRef} className="bg-gray-50 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* ── Section header ──────────────────────────────── */}
        <div ref={headerRef} className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-1.5 rounded-full bg-green-600 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xl font-black text-gray-900 sm:text-2xl lg:text-3xl leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous"
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-green-500 hover:text-green-600 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => swiper?.slideNext()}
              aria-label="Next"
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-green-500 hover:text-green-600 transition"
            >
              <ChevronRight size={18} />
            </button>
            <Link
              href={`/${vehicleType}`}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── Swiper ──────────────────────────────────────── */}
        <Swiper
          modules={[Navigation]}
          onSwiper={setSwiper}
          spaceBetween={16}
          breakpoints={{
            0:    { slidesPerView: 1.1,  spaceBetween: 12 },
            480:  { slidesPerView: 1.6,  spaceBetween: 14 },
            640:  { slidesPerView: 2,    spaceBetween: 16 },
            768:  { slidesPerView: 2.4,  spaceBetween: 18 },
            1024: { slidesPerView: 3,    spaceBetween: 20 },
            1280: { slidesPerView: 3.5,  spaceBetween: 20 },
            1536: { slidesPerView: 4,    spaceBetween: 20 },
          }}
          className="pb-2 [&_.swiper-wrapper]:items-stretch"
        >
          {vehicles.map((v) => (
            <SwiperSlide key={v.id || v.slug} className="flex! flex-col vs-slide">
              <VehicleCard vehicle={v} vehicleType={vehicleType} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ── Mobile view all ─────────────────────────────── */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href={`/${vehicleType}`}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition"
          >
            View All {title} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function VehicleCard({ vehicle, vehicleType }) {
  const [imgErr, setImgErr] = useState(false);
  const href   = `/${vehicleType}/${vehicle.slug}`;
  const tagCls = TAG_COLORS[vehicle.tag] || "bg-gray-700 text-white";

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">

      {/* ── Image ──────────────────────────────────── */}
      <Link
        href={href}
        className="relative block w-full overflow-hidden bg-white"
        style={{ aspectRatio: "16/10" }}
      >
        {vehicle.image && !imgErr ? (
          <Image
            src={vehicle.image}
            alt={vehicle.name}
            fill
            onError={() => setImgErr(true)}
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 380px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl text-gray-100">
            &#9889;
          </div>
        )}

        {/* Tag badge */}
        {vehicle.tag && (
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow-sm ${tagCls}`}>
            {vehicle.tag}
          </span>
        )}

        {/* Brand logo */}
        {vehicle.brandLogo && (
          <div className="absolute bottom-3 right-3 h-10 w-10 rounded-xl border border-gray-100 bg-white shadow-md flex items-center justify-center p-1.5">
            <Image
              src={vehicle.brandLogo}
              alt={vehicle.brand}
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        )}
      </Link>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">

        {/* Brand */}
        <p className="text-xs font-black uppercase tracking-widest text-green-600">
          {vehicle.brand}
        </p>

        {/* Model name */}
        <Link href={href} className="mt-1 block">
          <h3 className="text-base font-black leading-snug text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
            {vehicle.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-3">
          <p className="text-lg font-black text-gray-900">
            {fmtPrice(vehicle.price, vehicle.priceMax)}
          </p>
          {vehicle.emi && (
            <p className="text-xs text-gray-400 mt-0.5">EMI from {vehicle.emi}/mo</p>
          )}
        </div>

        {/* Spec pills */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <SpecPill
            icon={<BatteryCharging size={16} className="text-green-600" />}
            label="Range" value={vehicle.range} bg="bg-green-50"
          />
          <SpecPill
            icon={<Zap size={16} className="text-blue-500" />}
            label="Motor" value={vehicle.motor} bg="bg-blue-50"
          />
          <SpecPill
            icon={<Gauge size={16} className="text-purple-500" />}
            label="Speed" value={vehicle.speed} bg="bg-purple-50"
          />
        </div>

        {/* Color swatches */}
        {vehicle.colors?.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-gray-400 mr-0.5">
              {vehicle.colors.length} Colors
            </span>
            {vehicle.colors.slice(0, 8).map((c, i) => (
              <span
                key={i}
                title={c}
                className="h-4 w-4 rounded-full border border-gray-200 shadow-sm shrink-0"
                style={{ backgroundColor: c || "#888" }}
              />
            ))}
            {vehicle.colors.length > 8 && (
              <span className="text-xs text-gray-400">+{vehicle.colors.length - 8}</span>
            )}
          </div>
        )}

        {/* CTA buttons */}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-2.5">
          <Link
            href={`/compare?v1=${vehicle.slug}`}
            onClick={e => e.stopPropagation()}
            className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-600 hover:border-green-500 hover:text-green-700 transition"
          >
            + Compare
          </Link>
          <Link
            href={href}
            className="rounded-xl bg-green-600 py-2.5 text-center text-sm font-bold text-white hover:bg-green-700 transition"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function SpecPill({ icon, label, value, bg }) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl ${bg} py-3 px-2`}>
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-xs font-black text-gray-800 line-clamp-1 w-full text-center">
        {value || "—"}
      </span>
    </div>
  );
}
