"use client";
import { useEffect, useRef } from "react";
import { usePathname }       from "next/navigation";

function getOrCreateSession() {
  try {
    let id = sessionStorage.getItem("_ev_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("_ev_sid", id);
    }
    return id;
  } catch { return "anon"; }
}

function detectDevice() {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPod/.test(ua)) return "mobile";
  if (/iPad|Tablet/.test(ua))              return "tablet";
  return "desktop";
}

function getUtm() {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      source:   p.get("utm_source")   || "",
      medium:   p.get("utm_medium")   || "",
      campaign: p.get("utm_campaign") || "",
    };
  } catch { return {}; }
}

function sendPageview(pathname) {
  const payload = JSON.stringify({
    path:      pathname,
    title:     document.title,
    referrer:  document.referrer
      ? (() => { try { return new URL(document.referrer).hostname; } catch { return ""; } })()
      : "",
    sessionId: getOrCreateSession(),
    device:    detectDevice(),
    utm:       getUtm(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/pageview",
        new Blob([payload], { type: "application/json" }),
      );
    } else {
      fetch("/api/analytics/pageview", {
        method:    "POST",
        body:      payload,
        headers:   { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

// Track how far users scroll (25 / 50 / 75 / 100 %)
function useScrollDepth(enabled) {
  useEffect(() => {
    if (!enabled) return;
    const reached = new Set();
    const milestones = [25, 50, 75, 100];

    function onScroll() {
      const el  = document.documentElement;
      const pct = Math.round(((el.scrollTop + window.innerHeight) / el.scrollHeight) * 100);
      milestones.forEach(m => {
        if (pct >= m && !reached.has(m)) {
          reached.add(m);
          // Send a scroll-depth event (non-blocking)
          const p = JSON.stringify({
            path:      window.location.pathname,
            sessionId: getOrCreateSession(),
            depth:     m,
          });
          try {
            navigator.sendBeacon?.(
              "/api/analytics/scroll",
              new Blob([p], { type: "application/json" }),
            );
          } catch {}
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef(null);
  const isArticle = pathname.startsWith("/news/") && pathname.split("/").length > 2;

  useScrollDepth(isArticle);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    if (pathname.startsWith("/admin"))  return;
    lastPath.current = pathname;
    sendPageview(pathname);
  }, [pathname]);

  return null;
}
