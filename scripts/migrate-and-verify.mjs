/**
 * migrate-and-verify.mjs
 * 1. Copies any vehicles from the old "test" DB to "Ev-vehicles"
 * 2. Verifies all bikes are present
 * Run: node scripts/migrate-and-verify.mjs
 */
import { MongoClient } from "mongodb";

const URI    = "mongodb+srv://rahulwebdeveloper12_db_user:udPOmJd7tHBRNqmj@ev-vehicles.npunihy.mongodb.net/?appName=Ev-vehicles";
const TARGET = "Ev-vehicles";
const SOURCE = "test";

const client = new MongoClient(URI);
await client.connect();
console.log("✓ Connected to MongoDB\n");

const targetCol = client.db(TARGET).collection("vehicles");
const sourceCol = client.db(SOURCE).collection("vehicles");

// Migrate vehicles from "test" → "Ev-vehicles" (skip if slug already exists)
const oldVehicles = await sourceCol.find({}).toArray();
console.log(`Found ${oldVehicles.length} vehicles in "${SOURCE}" database to migrate:`);

let migrated = 0;
for (const v of oldVehicles) {
  const { _id, ...doc } = v;
  const exists = await targetCol.findOne({ slug: doc.slug });
  if (!exists) {
    await targetCol.insertOne({ ...doc, createdAt: doc.createdAt || new Date(), updatedAt: new Date() });
    console.log(`  ✓ Migrated: ${doc.name}`);
    migrated++;
  } else {
    console.log(`  = Already exists: ${doc.name}`);
  }
}

// Final count
const total  = await targetCol.countDocuments();
const bikes  = await targetCol.countDocuments({ vehicleType: "bike" });
const cars   = await targetCol.countDocuments({ vehicleType: "car" });
const pub    = await targetCol.countDocuments({ status: "published" });

console.log(`\n╔═══════════════════════════════════════╗`);
console.log(`║  DATABASE: "${TARGET}"          ║`);
console.log(`╠═══════════════════════════════════════╣`);
console.log(`║  Total vehicles:   ${String(total).padEnd(18)}║`);
console.log(`║  Electric Bikes:   ${String(bikes).padEnd(18)}║`);
console.log(`║  Electric Cars:    ${String(cars).padEnd(18)}║`);
console.log(`║  Published:        ${String(pub).padEnd(18)}║`);
console.log(`║  Migrated from test: ${String(migrated).padEnd(16)}║`);
console.log(`╚═══════════════════════════════════════╝`);

// List all bike names
const allBikes = await targetCol.find({ vehicleType: "bike" }, { projection: { name: 1, status: 1, category: 1, featured: 1 } }).toArray();
console.log(`\nAll bikes in "${TARGET}":`);
allBikes.forEach((b, i) => {
  const flags = [b.featured ? "⭐ featured" : "", b.status].filter(Boolean).join(" · ");
  console.log(`  ${i + 1}. ${b.name} [${b.category}] — ${flags}`);
});

await client.close();
console.log("\n✓ Done. Restart your dev server to pick up the new MONGODB_URI.\n");
