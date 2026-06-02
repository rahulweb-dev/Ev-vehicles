import { MongoClient } from "mongodb";

const URI = "mongodb+srv://rahulwebdeveloper12_db_user:udPOmJd7tHBRNqmj@ev-vehicles.npunihy.mongodb.net/?appName=Ev-vehicles";
const client = new MongoClient(URI);

await client.connect();

// Default database (what Mongoose uses when no db in URI)
const defaultDb = client.db();
console.log("Default db name:", defaultDb.databaseName);

// List all databases
const adminDb = client.db().admin();
const { databases } = await adminDb.listDatabases();

console.log("\nAll databases with vehicle collections:");
for (const db of databases) {
  const cols = await client.db(db.name).listCollections().toArray();
  const hasVehicles = cols.some((c) => c.name === "vehicles");
  if (hasVehicles) {
    const count = await client.db(db.name).collection("vehicles").countDocuments();
    const bikeCount = await client.db(db.name).collection("vehicles").countDocuments({ vehicleType: "bike" });
    console.log(`  DB: "${db.name}" → ${count} total vehicles, ${bikeCount} bikes`);
  }
}

await client.close();
