"use client";

import { useReportWebVitals } from "next/web-vitals";

// Reports Core Web Vitals to Google Analytics 4
export default function WebVitals() {
  useReportWebVitals((metric) => {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", metric.name, {
      value:         Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      event_category: "Web Vitals",
      event_label:   metric.id,
      non_interaction: true,
    });
  });
  return null;
}
