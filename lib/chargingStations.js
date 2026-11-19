// Server-side queries for the charging-station finder and city pages.
import CENTERS from "./city-centers.json";

export const CITY_CENTERS = CENTERS; // { slug: [lat, lng] }
export const INDIA_BOUNDS = { minLat: 6, maxLat: 37.6, minLng: 68, maxLng: 97.5 };
export const inIndia = (lat, lng) => lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat && lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng;

const PUBLIC_FIELDS = { name: 1, network: 1, operator: 1, address: 1, city: 1, state: 1, location: 1, connectors: 1, maxPowerKw: 1, dcFast: 1, batterySwap: 1, vehicleTypes: 1, points: 1, fee: 1, charge: 1, openingHours: 1, verified: 1, problemReports: 1, source: 1 };

/** Stations nearest to a point, with distance in km. filter: { vehicle: "car"|"two_wheeler", dc: bool, swap: bool } */
export async function stationsNear({ lat, lng, radiusKm = 25, limit = 100, filter = {} }) {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const ChargingStation = (await import("@/lib/models/ChargingStation")).default;
  await dbConnect();
  const query = { status: "active" };
  if (filter.vehicle) query.vehicleTypes = filter.vehicle;
  if (filter.dc) query.dcFast = true;
  if (filter.swap) query.batterySwap = true;
  const rows = await ChargingStation.aggregate([
    { $geoNear: { near: { type: "Point", coordinates: [lng, lat] }, distanceField: "distanceM", maxDistance: radiusKm * 1000, spherical: true, query } },
    { $limit: Math.min(limit, 300) },
    { $project: { ...PUBLIC_FIELDS, distanceM: 1 } },
  ]);
  return rows.map(serialize);
}

export function serialize(s) {
  const [lng, lat] = s.location?.coordinates || [];
  return {
    id: String(s._id), name: s.name, network: s.network || s.operator || "", address: s.address || "", city: s.city || "", state: s.state || "",
    lat, lng, distanceKm: s.distanceM != null ? Math.round(s.distanceM / 100) / 10 : null,
    connectors: s.connectors || [], maxPowerKw: s.maxPowerKw || null, dcFast: !!s.dcFast, batterySwap: !!s.batterySwap,
    vehicleTypes: s.vehicleTypes || [], points: s.points || null, fee: s.fee || "", charge: s.charge || "", openingHours: s.openingHours || "",
    verified: !!s.verified, problemReports: s.problemReports || 0, source: s.source?.provider || "",
  };
}

export async function stationStats() {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const ChargingStation = (await import("@/lib/models/ChargingStation")).default;
  await dbConnect();
  const [total, dc, byCity] = await Promise.all([
    ChargingStation.countDocuments({ status: "active" }),
    ChargingStation.countDocuments({ status: "active", dcFast: true }),
    ChargingStation.aggregate([{ $match: { status: "active", citySlug: { $ne: "" } } }, { $group: { _id: "$citySlug", n: { $sum: 1 } } }]),
  ]);
  return { total, dc, byCity: Object.fromEntries(byCity.map((x) => [x._id, x.n])) };
}
