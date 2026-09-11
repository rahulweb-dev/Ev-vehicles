"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";

const DEFAULT_FALLBACK = "/images/og-default.jpg";

function cleanSrc(src) {
  return typeof src === "string" ? src.trim() : "";
}

// Build a deduplicated ordered list: [primary, secondary?, DEFAULT_FALLBACK]
function buildSources(src, fallbackSrc) {
  const primary   = cleanSrc(src) || DEFAULT_FALLBACK;
  const secondary = cleanSrc(fallbackSrc) || DEFAULT_FALLBACK;
  const list = [primary];
  if (secondary !== primary) list.push(secondary);
  if (!list.includes(DEFAULT_FALLBACK)) list.push(DEFAULT_FALLBACK);
  return list;
}

export default function ArticleImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt = "",
  className = "",
  priority = false,
  loading,
  ...props
}) {
  const sources = buildSources(src, fallbackSrc);

  // idx tracks which source in the chain we're currently showing
  const [idx, setIdx]           = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const imgRef = useRef(null);

  // Reset the chain whenever the primary src prop changes (e.g. tab switches)
  useEffect(() => {
    setIdx(0);
    setAllFailed(false);
  // Re-run only when the actual src string changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Detect images that already failed BEFORE React hydrated.
  // The browser fires onerror synchronously; if that happens before React
  // attaches our onError listener, the broken state sticks forever.
  // Checking complete + naturalWidth === 0 after mount catches those cases.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      advance();
    }
  // Re-run each time the displayed src changes, in case the new src also
  // already has a cached failure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function advance() {
    if (idx < sources.length - 1) {
      setIdx((i) => i + 1);
    } else {
      setAllFailed(true);
    }
  }

  // All sources exhausted — render an accessible text placeholder
  if (allFailed) {
    return (
      <div
        aria-label={alt || undefined}
        role={alt ? "img" : undefined}
        className={`flex items-center justify-center bg-gray-100 text-xs font-semibold text-gray-400 ${className}`}
      >
        {alt || "Image unavailable"}
      </div>
    );
  }

  const currentSrc = sources[idx];

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading || (priority ? "eager" : "lazy")}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      onError={advance}
      {...props}
    />
  );
}
