"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

export default function PromoBanner({ platform = "desktop", position = "sidebar" }) {
  const [banners,   setBanners]   = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    fetch(`/api/banners?status=active&platform=${platform}`)
      .then(r => r.json())
      .then(d => setBanners(d.banners || []))
      .catch(() => {});
  }, [platform]);

  // Auto-rotate if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  const visible = banners.filter(b => !dismissed.has(b._id));
  if (visible.length === 0) return null;

  const banner = visible[current % visible.length];
  if (!banner) return null;

  const dismiss = (id) => setDismissed(s => { const n = new Set(s); n.add(id); return n; });

  if (position === "inline") {
    return (
      <div className="relative my-8 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <button onClick={() => dismiss(banner._id)}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition">
          <X size={14} />
        </button>
        <Link href={banner.ctaHref || "/"} target="_blank" rel="noopener noreferrer">
          <div className="relative aspect-[3/1] w-full bg-gray-100">
            <Image src={banner.image} alt={banner.title} fill className="object-cover" sizes="700px" />
          </div>
          <div className="bg-gradient-to-r from-green-700 to-green-500 px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-100">{banner.tag || "Sponsored"}</p>
              <p className="font-black text-white">{banner.title}</p>
              {banner.subtitle && <p className="text-xs text-green-100">{banner.subtitle}</p>}
            </div>
            <span className="rounded-xl bg-white px-4 py-2 text-xs font-black text-green-700">{banner.ctaLabel || "Explore"}</span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <button onClick={() => dismiss(banner._id)}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition">
        <X size={12} />
      </button>
      <Link href={banner.ctaHref || "/"} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-video w-full bg-gray-100">
          <Image src={banner.image} alt={banner.title} fill className="object-cover" sizes="350px" />
        </div>
        <div className="p-4">
          {banner.tag && (
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-white mb-2 ${banner.tagColor || "bg-green-500"}`}>{banner.tag}</span>
          )}
          <p className="font-black text-gray-900 leading-snug">{banner.title}</p>
          {banner.subtitle && <p className="mt-1 text-xs text-gray-500">{banner.subtitle}</p>}
          <div className={`mt-3 inline-block rounded-xl px-4 py-2 text-xs font-black text-white ${banner.tagColor || "bg-green-600"}`}>
            {banner.ctaLabel || "Explore"}
          </div>
        </div>
      </Link>

      {/* Dots for multiple banners */}
      {visible.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-3">
          {visible.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current % visible.length ? "w-4 bg-green-600" : "w-1.5 bg-gray-200"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
