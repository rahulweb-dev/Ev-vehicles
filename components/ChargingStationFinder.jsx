"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Zap, Navigation, Loader2, ChevronRight, ExternalLink, BatteryCharging, Wifi } from "lucide-react";

const POPULAR_CITIES = [
  { name: "Mumbai",    lat: 19.0760, lng: 72.8777 },
  { name: "Delhi",     lat: 28.6139, lng: 77.2090 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai",   lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Pune",      lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Kolkata",   lat: 22.5726, lng: 88.3639 },
];

async function fetchStations(lat, lng, radius = 15) {
  const url = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN&latitude=${lat}&longitude=${lng}&distance=${radius}&distanceunit=km&maxresults=30&compact=true&verbose=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function getConnectorLabel(conn) {
  return conn?.ConnectionType?.Title || "Unknown";
}

function getStatusColor(status) {
  const s = status?.IsOperational;
  if (s === true)  return "bg-green-100 text-green-700";
  if (s === false) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function getStatusLabel(status) {
  const s = status?.IsOperational;
  if (s === true)  return "Operational";
  if (s === false) return "Not Operational";
  return "Unknown";
}

export default function ChargingStationFinder() {
  const [stations, setStations] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [city,     setCity]     = useState(null);
  const [radius,   setRadius]   = useState(15);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async (lat, lng) => {
    setLoading(true); setError("");
    try {
      const data = await fetchStations(lat, lng, radius);
      setStations(data || []);
      if (!data?.length) setError("No charging stations found in this area. Try increasing the radius.");
    } catch {
      setError("Failed to load stations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [radius]);

  const handleCity = (c) => {
    setCity(c);
    load(c.lat, c.lng);
  };

  const locateMe = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setCity({ name: "Your Location", lat: pos.coords.latitude, lng: pos.coords.longitude });
        load(pos.coords.latitude, pos.coords.longitude);
      },
      () => { setLocating(false); setError("Location access denied."); }
    );
  };

  useEffect(() => {
    if (city) load(city.lat, city.lng);
  }, [radius]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-green-600">Charging Stations</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900">EV Charging Stations Finder</h1>
          <p className="mt-1 text-gray-500">Find charging points near you across India — powered by Open Charge Map.</p>
        </div>

        {/* Controls */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={locateMe} disabled={locating}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70">
              {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              Use My Location
            </button>
            {POPULAR_CITIES.map(c => (
              <button key={c.name} onClick={() => handleCity(c)}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  city?.name === c.name ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-600 shrink-0">Radius: {radius} km</span>
            <input type="range" min={5} max={50} step={5} value={radius} onChange={e => setRadius(+e.target.value)}
              className="w-48 accent-green-600" />
            {city && <span className="text-xs text-gray-400">{stations.length} station{stations.length !== 1 ? "s" : ""} found</span>}
          </div>
        </div>

        {/* Initial state */}
        {!city && !loading && (
          <div className="rounded-2xl bg-white py-20 text-center shadow-sm">
            <BatteryCharging size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold text-gray-500">Select a city or use your location</p>
            <p className="mt-1 text-sm text-gray-400">We'll show EV charging stations near you</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-green-500" />
          </div>
        )}

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {!loading && stations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((s, i) => {
              const addr = s.AddressInfo;
              const conns = s.Connections || [];
              const status = s.StatusType;
              const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${addr?.Latitude},${addr?.Longitude}`;
              return (
                <div key={i} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={16} className="shrink-0 text-green-600" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{addr?.Title || "Charging Station"}</h3>
                        <p className="text-xs text-gray-500 truncate">{addr?.AddressLine1}{addr?.Town ? `, ${addr.Town}` : ""}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  {s.OperatorInfo?.Title && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
                      <Wifi size={11} /> {s.OperatorInfo.Title}
                    </div>
                  )}

                  {conns.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {conns.slice(0, 4).map((c, ci) => (
                        <span key={ci} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          {getConnectorLabel(c)} {c.PowerKW ? `${c.PowerKW}kW` : ""}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {s.NumberOfPoints ? `${s.NumberOfPoints} point${s.NumberOfPoints !== 1 ? "s" : ""}` : "—"}
                    </span>
                    <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700">
                      Directions <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Data sourced from <a href="https://openchargemap.org" target="_blank" rel="noopener noreferrer" className="underline">Open Charge Map</a> — community-contributed, may not be 100% accurate.
        </p>
      </div>
    </div>
  );
}
