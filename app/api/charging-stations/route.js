import { NextResponse } from "next/server";
import { stationsNear, inIndia, CITY_CENTERS } from "@/lib/chargingStations";
import { readLimiter, getIp } from "@/lib/rateLimit";

// GET /api/charging-stations?lat=..&lng=..&radius=25&vehicle=car|two_wheeler&dc=1&swap=1
//     /api/charging-stations?city=pune
export async function GET(request) {
  const rl = readLimiter.check(getIp(request));
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const sp = new URL(request.url).searchParams;
  let lat = parseFloat(sp.get("lat")), lng = parseFloat(sp.get("lng"));
  const city = sp.get("city");
  if (city && CITY_CENTERS[city]) [lat, lng] = CITY_CENTERS[city];
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inIndia(lat, lng)) {
    return NextResponse.json({ error: "A location in India is required" }, { status: 400 });
  }
  const radiusKm = Math.min(Math.max(parseFloat(sp.get("radius")) || 25, 1), 150);
  const vehicle = ["car", "two_wheeler", "bus_truck"].includes(sp.get("vehicle")) ? sp.get("vehicle") : undefined;
  try {
    const stations = await stationsNear({ lat, lng, radiusKm, limit: 200, filter: { vehicle, dc: sp.get("dc") === "1", swap: sp.get("swap") === "1" } });
    return NextResponse.json({ center: { lat, lng }, radiusKm, count: stations.length, stations },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
  } catch (err) {
    console.error("[GET /api/charging-stations]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
