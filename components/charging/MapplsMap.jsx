"use client";

// Mappls (MapmyIndia) map with station markers. Shows India's official boundaries.
// Needs NEXT_PUBLIC_MAPPLS_KEY (Mappls static key, restricted to evradar.in). Renders nothing
// useful without a key — the finder still works as a list.
import { useEffect, useRef, useState } from "react";

const KEY = process.env.NEXT_PUBLIC_MAPPLS_KEY || "";
let loader = null;
function loadSdk() {
  if (typeof window === "undefined" || !KEY) return Promise.reject(new Error("no key"));
  if (window.mappls?.Map) return Promise.resolve(window.mappls);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      window.__mapplsReady = () => resolve(window.mappls);
      const s = document.createElement("script");
      s.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${encodeURIComponent(KEY)}&callback=__mapplsReady`;
      s.async = true;
      s.onerror = () => { loader = null; reject(new Error("Mappls SDK failed to load")); };
      document.head.appendChild(s);
    });
  }
  return loader;
}

const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const mapsAvailable = !!KEY;

export default function MapplsMap({ center, zoom = 12, stations = [], picking = false, onPick, onSelect, className = "" }) {
  const el = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const handlers = useRef({ onPick, onSelect, picking });
  const [error, setError] = useState(KEY ? "" : "Map unavailable");
  useEffect(() => { handlers.current = { onPick, onSelect, picking }; });

  // Create the map once
  useEffect(() => {
    let cancelled = false;
    loadSdk().then((mappls) => {
      if (cancelled || !el.current || map.current) return;
      map.current = new mappls.Map(el.current, { center: { lat: center.lat, lng: center.lng }, zoom, zoomControl: true });
      try {
        map.current.addListener("click", (e) => {
          if (!handlers.current.picking) return;
          const ll = e?.lngLat || e?.latLng || e?.latlng;
          const lat = typeof ll?.lat === "function" ? ll.lat() : ll?.lat, lng = typeof ll?.lng === "function" ? ll.lng() : ll?.lng;
          if (Number.isFinite(lat) && Number.isFinite(lng)) handlers.current.onPick?.({ lat, lng });
        });
      } catch { /* click picking unsupported — the form also accepts "use my location" */ }
    }).catch((e) => !cancelled && setError(e.message || "Map unavailable"));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-centre when the search location changes
  useEffect(() => {
    const m = map.current; if (!m) return;
    try { m.setCenter({ lat: center.lat, lng: center.lng }); m.setZoom(zoom); } catch { /* ignore */ }
  }, [center.lat, center.lng, zoom]);

  // Station markers
  useEffect(() => {
    let tries = 0, timer;
    const draw = () => {
      const m = map.current, mappls = window.mappls;
      if (!m || !mappls) { if (tries++ < 40) timer = setTimeout(draw, 250); return; }
      for (const mk of markers.current) { try { mappls.remove({ map: m, layer: mk }); } catch { /* ignore */ } }
      markers.current = stations.slice(0, 150).map((s) => {
        try {
          const mk = new mappls.Marker({
            map: m, position: { lat: s.lat, lng: s.lng }, fitbounds: false,
            popupHtml: `<div style="font:13px system-ui;max-width:220px"><b>${esc(s.name)}</b><br>${esc(s.network)}${s.maxPowerKw ? ` · ${s.maxPowerKw} kW` : ""}${s.distanceKm != null ? `<br>${s.distanceKm} km away` : ""}<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}">Navigate →</a></div>`,
          });
          try { mk.addListener("click", () => handlers.current.onSelect?.(s.id)); } catch { /* ignore */ }
          return mk;
        } catch { return null; }
      }).filter(Boolean);
    };
    draw();
    return () => clearTimeout(timer);
  }, [stations]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${className}`}>
      <div ref={el} className="h-full w-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-gray-500">
          Map view isn&apos;t available right now — the list below shows all stations with directions.
        </div>
      )}
      {picking && !error && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white shadow">Tap the map at the station&apos;s location</div>
      )}
    </div>
  );
}
