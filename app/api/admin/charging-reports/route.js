import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import StationReport from "@/lib/models/StationReport";
import ChargingStation from "@/lib/models/ChargingStation";
import { CITY_CENTERS } from "@/lib/chargingStations";
import CITY_DATA from "@/lib/city-tax-data.json";

async function requireAdmin() {
  const user = await getAuthUser();
  return user && user.role === "admin" ? user : null;
}

// GET /api/admin/charging-reports?status=pending
export async function GET(request) {
  await dbConnect();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status") || "pending";
  const [reports, counts] = await Promise.all([
    StationReport.find(status === "all" ? {} : { status }).sort({ createdAt: -1 }).limit(200)
      .populate("station", "name network address city location status problemReports").lean(),
    StationReport.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  return NextResponse.json({ reports, counts: Object.fromEntries(counts.map((c) => [c._id, c.n])) });
}

function nearestCity(lat, lng) {
  let best = null;
  for (const [slug, [clat, clng]] of Object.entries(CITY_CENTERS)) {
    const d = Math.hypot(lat - clat, (lng - clng) * Math.cos((lat * Math.PI) / 180)) * 111;
    if (!best || d < best.d) best = { slug, d };
  }
  return best && best.d <= 40 ? CITY_DATA.cities.find((c) => c.slug === best.slug) : null;
}

// PATCH { id, action: "approve" | "reject", note? }
export async function PATCH(request) {
  await dbConnect();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action, note = "" } = await request.json();
  if (!mongoose.isValidObjectId(id) || !["approve", "reject"].includes(action)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const r = await StationReport.findById(id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (r.status !== "pending") return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  let effect = "";
  if (action === "approve") {
    if (r.kind === "missing") {
      const [lng, lat] = r.location?.coordinates || [];
      if (!Number.isFinite(lat)) return NextResponse.json({ error: "Report has no location" }, { status: 400 });
      const city = nearestCity(lat, lng);
      const ct = (r.chargerType || "").toLowerCase();
      const st = await ChargingStation.create({
        name: r.name || r.network || "EV charging station", network: r.network, address: r.address,
        city: city?.name || r.city, citySlug: city?.slug || "", state: city?.state || "",
        location: { type: "Point", coordinates: [lng, lat] },
        dcFast: ct.includes("dc"), batterySwap: ct.includes("swap"),
        vehicleTypes: ct.includes("two") || ct.includes("swap") ? ["two_wheeler"] : ["car"],
        source: { provider: "user", id: String(r._id) }, status: "active", verified: true,
      });
      effect = `Station added (${st._id})`;
    } else if (r.station) {
      const st = await ChargingStation.findById(r.station);
      if (st) {
        if (r.issue === "closed") { st.status = "closed"; effect = "Station marked closed"; }
        else if (r.issue === "wrong_location" && r.location?.coordinates?.length === 2) { st.location = r.location; effect = "Location corrected"; }
        else if (r.issue === "not_working") { st.problemReports = (st.problemReports || 0) + 1; effect = "Flagged as reported not working"; }
        else effect = "Noted (edit the station details manually if needed)";
        await st.save();
      }
    }
  }
  r.status = action === "approve" ? "approved" : "rejected";
  r.adminNote = [note, effect].filter(Boolean).join(" — ");
  await r.save();
  return NextResponse.json({ success: true, effect });
}
