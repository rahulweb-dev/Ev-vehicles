import { NextResponse, after } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import StationReport from "@/lib/models/StationReport";
import ChargingStation from "@/lib/models/ChargingStation";
import { formLimiter, getIp } from "@/lib/rateLimit";
import { inIndia } from "@/lib/chargingStations";
import { sendMail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/sanitize";

const clip = (v, n = 200) => (typeof v === "string" ? v.trim().slice(0, n) : "");

// POST /api/charging-stations/report — a visitor reports a missing station or a problem.
export async function POST(request) {
  const rl = formLimiter.check(getIp(request));
  if (!rl.ok) return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
  try {
    const b = await request.json();
    if (b.website) return NextResponse.json({ success: true }); // honeypot
    const kind = b.kind === "problem" ? "problem" : "missing";
    const lat = parseFloat(b.lat), lng = parseFloat(b.lng);
    await dbConnect();

    const doc = {
      kind, issue: ["not_working", "wrong_location", "closed", "wrong_details", "other"].includes(b.issue) ? b.issue : "",
      name: clip(b.name, 120), network: clip(b.network, 80), address: clip(b.address, 300), city: clip(b.city, 80),
      chargerType: clip(b.chargerType, 60), details: clip(b.details, 1000),
      reporterName: clip(b.reporterName, 80), reporterPhone: clip(b.reporterPhone, 15).replace(/\D/g, "").slice(-10),
    };
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      if (!inIndia(lat, lng)) return NextResponse.json({ error: "Location must be in India" }, { status: 400 });
      doc.location = { type: "Point", coordinates: [lng, lat] };
    }
    if (kind === "missing") {
      if (!doc.location) return NextResponse.json({ error: "Please set the station's location" }, { status: 400 });
      if (!doc.name && !doc.address) return NextResponse.json({ error: "Please add the station name or address" }, { status: 400 });
    } else {
      if (!mongoose.isValidObjectId(b.stationId)) return NextResponse.json({ error: "Station not found" }, { status: 400 });
      const st = await ChargingStation.findById(b.stationId).select("name").lean();
      if (!st) return NextResponse.json({ error: "Station not found" }, { status: 404 });
      doc.station = st._id;
      if (!doc.name) doc.name = st.name;
      if (!doc.issue) return NextResponse.json({ error: "Please choose what's wrong" }, { status: 400 });
    }
    const report = await StationReport.create(doc);

    after(async () => {
      try {
        const to = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "contact@evradar.in";
        const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");
        const rows = [["Type", kind === "missing" ? "Missing station" : `Problem: ${doc.issue}`], ["Name", doc.name], ["Network", doc.network], ["Address", doc.address], ["City", doc.city],
          ["Charger", doc.chargerType], ["Details", doc.details], ["Location", doc.location ? `${lat}, ${lng}` : "—"], ["Reporter", [doc.reporterName, doc.reporterPhone].filter(Boolean).join(" · ")]];
        await sendMail({ to, subject: `⚡ Charging station report: ${kind === "missing" ? "missing station" : doc.issue} — ${doc.name || doc.city || "unnamed"}`,
          html: `<h3>New charging-station report</h3><table>${rows.map(([k, v]) => `<tr><td style="color:#666;padding:4px 12px 4px 0">${escapeHtml(k)}</td><td><b>${escapeHtml(String(v || "—"))}</b></td></tr>`).join("")}</table><p><a href="${site}/admin/charging-reports">Review in admin →</a></p>` });
      } catch (e) { console.error("[station report email]", e?.message || e); }
    });

    return NextResponse.json({ success: true, id: report._id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/charging-stations/report]", err);
    return NextResponse.json({ error: "Could not save your report" }, { status: 500 });
  }
}
