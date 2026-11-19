"use client";

// EV charging-station finder: city / my-location search, filters, Mappls map, list, and
// visitor reports (missing station, problem with a station).
import { useEffect, useState } from "react";
import { MapPin, Navigation, Zap, Bike, Car, BatteryCharging, AlertTriangle, Plus, X, Loader2, CheckCircle, LocateFixed } from "lucide-react";
import MapplsMap from "./MapplsMap";

const RADII = [5, 10, 25, 50];

function Badge({ children, tone = "gray" }) {
  const tones = { gray: "bg-gray-100 text-gray-600", green: "bg-green-100 text-green-700", blue: "bg-blue-100 text-blue-700", amber: "bg-amber-100 text-amber-700", purple: "bg-purple-100 text-purple-700" };
  return <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tones[tone]}`}>{children}</span>;
}

function getPosition() {
  return new Promise((res, rej) => navigator.geolocation
    ? navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }), rej, { enableHighAccuracy: true, timeout: 10000 })
    : rej(new Error("no geolocation")));
}

function ReportModal({ hidden, mode, station, defaultCity, center, picked, onStartPick, onClose }) {
  const missing = mode === "missing";
  const [f, setF] = useState({ issue: "", name: "", network: "", chargerType: "", address: "", city: defaultCity || "", details: "", reporterName: "", reporterPhone: "", website: "" });
  const [loc, setLoc] = useState(null);
  const [state, setState] = useState("idle");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const point = picked || loc;

  async function useMyLocation() {
    try { setLoc(await getPosition()); setErr(""); } catch { setErr("Couldn't get your location — allow location access or pick the spot on the map."); }
  }
  async function submit(e) {
    e.preventDefault();
    setState("loading"); setErr("");
    try {
      const body = { ...f, kind: mode, stationId: station?.id, ...(point ? { lat: point.lat, lng: point.lng } : {}) };
      const res = await fetch("/api/charging-stations/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setState("done");
    } catch (e2) { setErr(e2.message); setState("idle"); }
  }

  const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white";
  return (
    <div className={`fixed inset-0 z-[200] items-end justify-center p-3 sm:items-center ${hidden ? "hidden" : "flex"}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-green-600 px-5 py-4 text-white">
          <p className="font-black">{missing ? "Add a missing charging station" : `Report a problem: ${station?.name}`}</p>
          <button onClick={onClose} aria-label="Close" className="rounded-full bg-white/20 p-1.5"><X size={16} /></button>
        </div>
        {state === "done" ? (
          <div className="p-8 text-center">
            <CheckCircle size={40} className="mx-auto text-green-600" />
            <p className="mt-3 font-black text-gray-900">Thanks — we&apos;ve received your report</p>
            <p className="mt-1 text-sm text-gray-500">Our team checks every report before updating the map.</p>
            <button onClick={onClose} className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 p-5">
            <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
            {!missing && (
              <select required value={f.issue} onChange={set("issue")} className={input}>
                <option value="">What&apos;s wrong? *</option>
                <option value="not_working">Charger not working</option>
                <option value="closed">Station closed permanently</option>
                <option value="wrong_location">Wrong location on map</option>
                <option value="wrong_details">Wrong name / network / charger details</option>
                <option value="other">Something else</option>
              </select>
            )}
            {missing && (
              <>
                <input value={f.name} onChange={set("name")} placeholder="Station name (e.g. Tata Power EZ Charge, Phoenix Mall)" className={input} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={f.network} onChange={set("network")} placeholder="Network / company" className={input} />
                  <select value={f.chargerType} onChange={set("chargerType")} className={input}>
                    <option value="">Charger type</option>
                    <option>DC fast (car)</option><option>AC (car)</option><option>Two-wheeler charger</option><option>Battery swap</option><option>Not sure</option>
                  </select>
                </div>
                <input value={f.address} onChange={set("address")} placeholder="Address / landmark" className={input} />
                <input value={f.city} onChange={set("city")} placeholder="City" className={input} />
              </>
            )}
            {(missing || f.issue === "wrong_location") && (
              <div className="rounded-xl border border-dashed border-green-300 bg-green-50 p-3 text-xs">
                <p className="font-bold text-green-800">{missing ? "Station location *" : "Correct location"}</p>
                {point ? <p className="mt-1 text-green-700">📍 {point.lat.toFixed(5)}, {point.lng.toFixed(5)}</p> : <p className="mt-1 text-gray-500">Stand at the station and use your location, or pick it on the map.</p>}
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={useMyLocation} className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 font-bold text-green-700 shadow-sm"><LocateFixed size={12} />Use my location</button>
                  <button type="button" onClick={onStartPick} className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-green-700 shadow-sm">Pick on map</button>
                  {!point && center && <button type="button" onClick={() => setLoc(center)} className="rounded-lg bg-white px-2.5 py-1.5 font-semibold text-gray-600 shadow-sm">Use map centre</button>}
                </div>
              </div>
            )}
            <textarea value={f.details} onChange={set("details")} rows={3} placeholder={missing ? "Anything else? (number of chargers, kW, timings, price)" : "Details (optional)"} className={input} />
            <div className="grid grid-cols-2 gap-2">
              <input value={f.reporterName} onChange={set("reporterName")} placeholder="Your name (optional)" className={input} />
              <input value={f.reporterPhone} onChange={set("reporterPhone")} placeholder="Mobile (optional)" inputMode="numeric" maxLength={10} className={input} />
            </div>
            {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{err}</p>}
            <button disabled={state === "loading"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-black text-white disabled:opacity-60">
              {state === "loading" && <Loader2 size={15} className="animate-spin" />}Submit report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ChargingFinder({ cities, initialCity = "delhi", centers }) {
  const startCity = cities.find((c) => c.slug === initialCity) || cities[0];
  const [center, setCenter] = useState({ lat: centers[startCity.slug][0], lng: centers[startCity.slug][1], label: startCity.name });
  const [radius, setRadius] = useState(25);
  const [vehicle, setVehicle] = useState("");
  const [dc, setDc] = useState(false);
  const [swap, setSwap] = useState(false);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null); // { mode, station }
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState(null);
  const [geoError, setGeoError] = useState("");

  // Results are tagged with the query they belong to; "loading" = the latest query hasn't returned yet.
  const query = new URLSearchParams({ lat: center.lat, lng: center.lng, radius, ...(vehicle && { vehicle }), ...(dc && { dc: "1" }), ...(swap && { swap: "1" }) }).toString();
  const [result, setResult] = useState({ query: null, stations: [], error: "" });
  useEffect(() => {
    let alive = true;
    fetch(`/api/charging-stations?${query}`)
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed"); return data.stations; })
      .then((stations) => alive && setResult({ query, stations, error: "" }))
      .catch((e) => alive && setResult({ query, stations: [], error: e.message }));
    return () => { alive = false; };
  }, [query]);
  const loading = result.query !== query;
  const stations = loading ? [] : result.stations;
  const error = geoError || (loading ? "" : result.error);

  async function nearMe() {
    try { const p = await getPosition(); setGeoError(""); setCenter({ ...p, label: "Your location" }); setRadius(10); }
    catch { setGeoError("Allow location access in your browser to find stations near you."); }
  }

  const chip = (active) => `flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${active ? "border-green-600 bg-green-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-green-400"}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={nearMe} className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-black text-white hover:bg-green-700"><LocateFixed size={15} />Near me</button>
        <select value={cities.find((c) => c.name === center.label)?.slug || ""} onChange={(e) => { const c = cities.find((x) => x.slug === e.target.value); if (c) setCenter({ lat: centers[c.slug][0], lng: centers[c.slug][1], label: c.name }); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800">
          <option value="" disabled>Choose a city</option>
          {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700">
          {RADII.map((r) => <option key={r} value={r}>Within {r} km</option>)}
        </select>
        <button onClick={() => { setReport({ mode: "missing" }); setPicked(null); }} className="ml-auto flex items-center gap-1.5 rounded-xl border border-green-600 px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50"><Plus size={15} />Add missing station</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={chip(vehicle === "car")} onClick={() => setVehicle(vehicle === "car" ? "" : "car")}><Car size={13} />Car</button>
        <button className={chip(vehicle === "two_wheeler")} onClick={() => setVehicle(vehicle === "two_wheeler" ? "" : "two_wheeler")}><Bike size={13} />Two-wheeler</button>
        <button className={chip(dc)} onClick={() => setDc(!dc)}><Zap size={13} />DC fast</button>
        <button className={chip(swap)} onClick={() => setSwap(!swap)}><BatteryCharging size={13} />Battery swap</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <MapplsMap className="h-[360px] lg:h-[620px]" center={center} zoom={radius <= 10 ? 13 : 11} stations={stations}
          picking={picking} onPick={(p) => { setPicked(p); setPicking(false); }} onSelect={setSelected} />

        <div className="max-h-[620px] overflow-y-auto rounded-2xl border border-gray-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3 text-sm">
            <p className="font-black text-gray-900"><MapPin size={14} className="mr-1 inline text-green-600" />{loading ? "Searching…" : `${stations.length} station${stations.length === 1 ? "" : "s"} within ${radius} km`}</p>
            <p className="text-xs text-gray-500">near {center.label}</p>
          </div>
          {error && <p className="m-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{error}</p>}
          {!loading && !error && stations.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">
              No stations found here yet. Know one? <button onClick={() => setReport({ mode: "missing" })} className="font-bold text-green-700 underline">Add it to the map</button>.
            </div>
          )}
          <ul className="divide-y divide-gray-50">
            {stations.map((s) => (
              <li key={s.id} className={`p-4 ${selected === s.id ? "bg-green-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-gray-900">{s.name}</p>
                    {s.network && s.network !== s.name && <p className="text-xs font-semibold text-green-700">{s.network}</p>}
                    {s.address && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{s.address}</p>}
                  </div>
                  {s.distanceKm != null && <span className="shrink-0 text-xs font-bold text-gray-700">{s.distanceKm} km</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.dcFast && <Badge tone="green">DC fast</Badge>}
                  {s.maxPowerKw && <Badge tone="blue">{s.maxPowerKw} kW</Badge>}
                  {s.connectors.slice(0, 3).map((c) => <Badge key={c.type}>{c.type}{c.count ? ` ×${c.count}` : ""}</Badge>)}
                  {s.vehicleTypes.includes("two_wheeler") && <Badge tone="purple">2W</Badge>}
                  {s.batterySwap && <Badge tone="purple">Swap</Badge>}
                  {s.verified && <Badge tone="green">Verified</Badge>}
                  {s.problemReports > 0 && <Badge tone="amber">Reported not working</Badge>}
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"><Navigation size={12} />Navigate</a>
                  <button onClick={() => { setReport({ mode: "problem", station: s }); setPicked(null); }}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-amber-400"><AlertTriangle size={12} />Report problem</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-[11px] text-gray-400">Station data: © OpenStreetMap contributors (ODbL) and Open Charge Map (CC BY-SA 4.0), plus reports verified by EV Radar. Always confirm availability with the operator before travelling.</p>

      {report && (
        <ReportModal hidden={picking} mode={report.mode} station={report.station} defaultCity={center.label !== "Your location" ? center.label : ""} center={center} picked={picked}
          onStartPick={() => setPicking(true)} onClose={() => { setReport(null); setPicked(null); }} />
      )}
    </div>
  );
}
