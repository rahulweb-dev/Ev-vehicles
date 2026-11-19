import mongoose from "mongoose";

// EV charging stations. Imported from OpenStreetMap / Open Charge Map (source.provider "osm" | "ocm")
// or added by visitors and approved by an admin ("user"). location is GeoJSON [lng, lat].
const ConnectorSchema = new mongoose.Schema({
  type: String,          // "CCS2", "Type 2", "CHAdeMO", "GB/T", "Bharat DC-001", "15A socket" …
  powerKw: Number,
  count: Number,
}, { _id: false });

const ChargingStationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  network: { type: String, trim: true, default: "" },
  operator: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  citySlug: { type: String, trim: true, default: "" },
  state: { type: String, trim: true, default: "" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  connectors: [ConnectorSchema],
  maxPowerKw: Number,
  dcFast: { type: Boolean, default: false },
  batterySwap: { type: Boolean, default: false },
  vehicleTypes: [String], // "car" | "two_wheeler" | "bus_truck"
  points: Number,
  fee: String, charge: String, openingHours: String, access: String,
  source: { provider: String, id: String },
  sourceUrl: String,
  status: { type: String, enum: ["active", "closed", "hidden"], default: "active" },
  verified: { type: Boolean, default: false },
  problemReports: { type: Number, default: 0 },
  lastSeenAt: Date,
}, { timestamps: true });

ChargingStationSchema.index({ location: "2dsphere" });
ChargingStationSchema.index({ status: 1, citySlug: 1 });
ChargingStationSchema.index({ "source.provider": 1, "source.id": 1 });

export default mongoose.models.ChargingStation || mongoose.model("ChargingStation", ChargingStationSchema);
