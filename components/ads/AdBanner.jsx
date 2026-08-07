"use client";

import { useEffect, useRef } from "react";

// Set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID in your .env.local to your real publisher ID
// Format: ca-pub-XXXXXXXXXXXXXXXXX (from Google AdSense dashboard)
const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-XXXXXXXXXXXXXXXXX";

export default function AdBanner({
  slot,
  format = "auto",
  layout,
  responsive = true,
  className = "",
  style = {},
}) {
  const adRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // AdSense not loaded in dev environment — this is expected
    }
  }, []);

  return (
    <div className={`adsense-container overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center", ...style }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout && { "data-ad-layout": layout })}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Pre-configured ad sizes for easy placement
export function AdBannerHorizontal({ slot, className }) {
  return (
    <AdBanner
      slot={slot || "1253319567"}
      format="auto"
      responsive
      className={`my-6 ${className}`}
      style={{ minHeight: "90px" }}
    />
  );
}

export function AdBannerRectangle({ slot, className }) {
  return (
    <AdBanner
      slot={slot || "1253319567"}
      format="auto"
      responsive
      className={`my-4 ${className}`}
      style={{ minHeight: "250px" }}
    />
  );
}

export function AdBannerInArticle({ slot, className }) {
  return (
    <div className={`my-8 rounded-2xl bg-gray-50 p-2 text-center ${className}`}>
      <p className="mb-1 text-[10px] uppercase tracking-widest text-gray-400">Advertisement</p>
      <AdBanner
        slot={slot || "1253319567"}
        format="fluid"
        layout="in-article"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}
