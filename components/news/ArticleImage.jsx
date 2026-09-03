"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

const DEFAULT_FALLBACK = "/images/og-default.jpg";

function cleanSrc(src) {
  return typeof src === "string" ? src.trim() : "";
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
  const normalizedFallback = cleanSrc(fallbackSrc) || DEFAULT_FALLBACK;
  const preferredSrc       = cleanSrc(src) || normalizedFallback;

  const [failedSources, setFailedSources] = useState([]);

  const mainFailed     = failedSources.includes(preferredSrc);
  const fallbackFailed = failedSources.includes(normalizedFallback);
  const defaultFailed  = failedSources.includes(DEFAULT_FALLBACK);

  let currentSrc;
  if (!mainFailed) {
    currentSrc = preferredSrc;
  } else if (normalizedFallback !== preferredSrc && !fallbackFailed) {
    currentSrc = normalizedFallback;
  } else if (DEFAULT_FALLBACK !== normalizedFallback && DEFAULT_FALLBACK !== preferredSrc && !defaultFailed) {
    currentSrc = DEFAULT_FALLBACK;
  } else if (!defaultFailed) {
    currentSrc = DEFAULT_FALLBACK;
  } else {
    return (
      <div
        aria-label={alt}
        role={alt ? "img" : undefined}
        className={`flex items-center justify-center bg-gray-100 text-xs font-semibold text-gray-400 ${className}`}
      >
        Image unavailable
      </div>
    );
  }

  function handleError() {
    setFailedSources((prev) =>
      prev.includes(currentSrc) ? prev : [...prev, currentSrc]
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading || (priority ? "eager" : "lazy")}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      onError={handleError}
      {...props}
    />
  );
}
