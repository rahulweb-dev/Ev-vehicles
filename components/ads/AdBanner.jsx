"use client";

import { useEffect, useRef } from "react";

// IMPORTANT: Replace with your actual AdSense publisher ID and slot IDs
// Publisher ID format: ca-pub-XXXXXXXXXXXXXXXXX
// Get ad slot IDs from your AdSense dashboard after creating ad units

const PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXXX";

export default function AdBanner({
  slot,
  format = "auto",
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
        style={{ display: "block", ...style }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Pre-configured ad sizes for easy placement
export function AdBannerHorizontal({ slot, className }) {
  return (
    <AdBanner
      slot={slot || "1234567890"}
      format="horizontal"
      className={`my-6 ${className}`}
      style={{ minHeight: "90px" }}
    />
  );
}

export function AdBannerRectangle({ slot, className }) {
  return (
    <AdBanner
      slot={slot || "0987654321"}
      format="rectangle"
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
        slot={slot || "1122334455"}
        format="fluid"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}
