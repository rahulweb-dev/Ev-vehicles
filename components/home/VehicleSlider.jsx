"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { BatteryCharging, Zap, Gauge, Star, ArrowRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";



export default function VehicleSlider({ title, vehicles = [], vehicleType = "cars" }) {
  const viewAllHref = `/${vehicleType}`;

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[1300px] px-4 lg:px-6">

        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-[22px] font-bold text-[#1a1a1a] lg:text-[32px]">{title}</h2>
          <Link href={viewAllHref} className="text-[18px] font-semibold text-[#1a1a1a] transition hover:text-[#00a651]">
            View All
          </Link>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={18}
          breakpoints={{
            320: { slidesPerView: 1.1 },
            480: { slidesPerView: 1.3 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2.3 },
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
      <Link href={href} className="relative block h-52 overflow-hidden">
        <Image
          src={vehicle.image}
          alt={vehicle.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-[#00a651] px-3 py-1 text-xs font-semibold text-white shadow">
          {vehicle.tag}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Brand */}
        <p className="text-sm font-semibold text-[#00a651]">{vehicle.brand}</p>

        {/* Name */}
        <Link href={href}>
          <h3 className="text-base font-bold leading-tight text-[#111] transition group-hover:text-[#00a651]">
            {vehicle.name}
          </h3>
        </Link>

        {/* Price */}
        <div>
          <p className="text-[17px] font-black text-[#111]">
            {vehicle.price} – {vehicle.priceMax}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">EMI {vehicle.emi}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-0.5 rounded-xl bg-green-50 py-2 px-1">
            <BatteryCharging size={15} className="text-[#00a651]" />
            <span className="text-[10px] text-gray-500">Range</span>
            <span className="text-[11px] font-bold text-[#111]">{vehicle.range}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl bg-blue-50 py-2 px-1">
            <Zap size={15} className="text-blue-500" />
            <span className="text-[10px] text-gray-500">Motor</span>
            <span className="text-[11px] font-bold text-[#111]">{vehicle.motor}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl bg-purple-50 py-2 px-1">
            <Gauge size={15} className="text-purple-500" />
            <span className="text-[10px] text-gray-500">Speed</span>
            <span className="text-[11px] font-bold text-[#111]">{vehicle.speed}</span>
          </div>
        </div>

        {/* Colors */}
        {vehicle.colors?.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{vehicle.colors.length} Colors:</span>
            <div className="flex gap-1">
              {vehicle.colors.map((color, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: color }}
                  className="h-4 w-4 rounded-full border border-gray-300"
                />
              ))}
            </div>
          </div>
        )}

        {/* Rating + Details Button */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-[#111]">{vehicle.rating}</span>
            <span className="text-xs text-gray-400">({vehicle.reviewCount?.toLocaleString()})</span>
          </div>
          <Link
            href={href}
            className="flex items-center gap-1 rounded-full bg-[#00a651] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#009245]"
          >
            Details <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  );
}
