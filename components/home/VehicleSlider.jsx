"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BatteryCharging, Zap, Gauge, Star, ArrowRight } from "lucide-react";
import { VehicleSliderSkeleton } from "@/components/skeletons/Skeletons";

import "swiper/css";
import "swiper/css/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function VehicleSlider({ title, vehicles = [], vehicleType = "cars" }) {
  const viewAllHref = `/${vehicleType}`;
  const [mounted, setMounted]   = useState(false);
  const sectionRef  = useRef(null);
  const headerRef   = useRef(null);

  /* Show skeleton on first render; reveal Swiper after mount */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* GSAP scroll-reveal for section header + slides */
  useEffect(() => {
    if (!mounted) return;
    const section = sectionRef.current;
    const header  = headerRef.current;
    const ctx = gsap.context(() => {
      gsap.from(header, {
        opacity: 0, y: 30, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: header, start: "top 90%" },
      });
      gsap.from(".vehicle-swiper .swiper-slide", {
        opacity: 0, y: 30, stagger: 0.07, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 85%" },
      });
    }, section);
    return () => {
      ctx.revert();
      ScrollTrigger.getAll()
        .filter(t => t.trigger === section || t.trigger === header)
        .forEach(t => t.kill());
    };
  }, [mounted]);

  /* Skeleton — visible on SSR and first client render */
  if (!mounted) {
    return <VehicleSliderSkeleton count={4} />;
  }

  return (
    <section ref={sectionRef} className="bg-white py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">

        <div ref={headerRef} className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg sm:text-[22px] font-bold text-[#1a1a1a] lg:text-[28px]">{title}</h2>
          <Link href={viewAllHref} className="text-sm sm:text-base font-semibold text-[#00a651] flex items-center gap-1 transition hover:text-[#009245]">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={18}
          breakpoints={{
            320:  { slidesPerView: 1.1 },
            480:  { slidesPerView: 1.3 },
            640:  { slidesPerView: 2 },
            768:  { slidesPerView: 2.3 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
            1536: { slidesPerView: 5 },
          }}
          className="vehicle-swiper"
        >
          {vehicles.map((vehicle) => (
            <SwiperSlide key={vehicle.id} className="h-auto">
              <VehicleCard vehicle={vehicle} vehicleType={vehicleType} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function VehicleCard({ vehicle, vehicleType }) {
  const href = vehicle.slug ? `/${vehicleType}/${vehicle.slug}` : `/${vehicleType}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Image */}
      <Link href={href} className="relative block h-52 overflow-hidden bg-gray-100">
        {vehicle.image ? (
          <Image src={vehicle.image} alt={vehicle.name} fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl text-gray-200">⚡</span>
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-[#00a651] px-3 py-1 text-xs font-semibold text-white shadow">
          {vehicle.tag}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-sm font-semibold text-[#00a651]">{vehicle.brand}</p>

        <Link href={href}>
          <h3 className="text-base font-bold leading-tight text-[#111] transition group-hover:text-[#00a651]">
            {vehicle.name}
          </h3>
        </Link>

        <div>
          <p className="text-[17px] font-black text-[#111]">{vehicle.price} – {vehicle.priceMax}</p>
          <p className="mt-0.5 text-xs text-gray-500">EMI {vehicle.emi}</p>
        </div>

        {/* Spec pills */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <BatteryCharging size={15} className="text-[#00a651]" />, label: "Range", value: vehicle.range, bg: "bg-green-50" },
            { icon: <Zap size={15} className="text-blue-500" />,             label: "Motor", value: vehicle.motor, bg: "bg-blue-50" },
            { icon: <Gauge size={15} className="text-purple-500" />,         label: "Speed", value: vehicle.speed, bg: "bg-purple-50" },
          ].map(({ icon, label, value, bg }) => (
            <div key={label} className={`flex flex-col items-center gap-0.5 rounded-xl ${bg} py-2 px-1`}>
              {icon}
              <span className="text-[10px] text-gray-500">{label}</span>
              <span className="text-[11px] font-bold text-[#111]">{value}</span>
            </div>
          ))}
        </div>

        {/* Colors */}
        {vehicle.colors?.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{vehicle.colors.length} Colors:</span>
            <div className="flex gap-1">
              {vehicle.colors.map((color, i) => (
                <span key={i} style={{ backgroundColor: color }}
                  className="h-4 w-4 rounded-full border border-gray-300" />
              ))}
            </div>
          </div>
        )}

        {/* Rating + button */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-[#111]">{vehicle.rating}</span>
            <span className="text-xs text-gray-400">({vehicle.reviewCount?.toLocaleString()})</span>
          </div>
          <Link href={href}
            className="flex items-center gap-1 rounded-full bg-[#00a651] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#009245]">
            Details <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
