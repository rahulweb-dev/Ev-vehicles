/**
 * seed-upcoming-bikes.mjs
 * Run: node scripts/seed-upcoming-bikes.mjs
 */
import { MongoClient } from "mongodb";

const URI    = "mongodb+srv://rahulwebdeveloper12_db_user:udPOmJd7tHBRNqmj@ev-vehicles.npunihy.mongodb.net/Ev-vehicles?appName=Ev-vehicles";
const DB     = "Ev-vehicles";

const upcomingBikes = [
  {
    name: "Ola Roadster",
    brand: "Ola Electric",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "ola-roadster",
    status: "published",
    featured: true,
    launchDate: new Date("2025-08-15"),
    shortDescription: "Ola's first electric motorcycle with 579 km range, 0–40 in 1.5 sec and a top speed of 126 km/h.",
    variants: [
      { name: "Roadster Standard", exShowroomPrice: "₹74,999", onRoadPrice: "₹86,000", batteryCapacity: "2.5 kWh", range: "193 km", availabilityStatus: "Upcoming", features: ["Entry Level", "MoveOS"] },
      { name: "Roadster S",        exShowroomPrice: "₹1,04,999", onRoadPrice: "₹1,20,000", batteryCapacity: "3.5 kWh", range: "320 km", availabilityStatus: "Upcoming", features: ["Mid Variant", "MoveOS", "Connected"] },
      { name: "Roadster Pro",      exShowroomPrice: "₹1,99,999", onRoadPrice: "₹2,25,000", batteryCapacity: "4.5 kWh", range: "579 km", availabilityStatus: "Upcoming", features: ["Top Spec", "Warp Mode", "Track Mode", "MoveOS 5"] },
    ],
    performance: { batteryCapacity: "4.5 kWh", drivingRange: "579 km", power: "15 kW", peakPower: "52 kW", torque: "105 Nm", topSpeed: "126 km/h", acceleration: "1.5 sec (0–40 km/h)", driveType: "Chain Drive", batteryType: "Lithium-Ion NMC" },
    charging: { acChargingTime: "3 hrs", dcChargingTime: "45 min (0–80%)", fastCharging: true, chargingPort: "CCS2" },
    specs: { length: "2037 mm", width: "826 mm", height: "1063 mm", wheelbase: "1429 mm", groundClearance: "186 mm", kerbWeight: "125 kg", seatingCapacity: "2", tyreType: "Tubeless", wheelSize: "17 inch Alloy" },
    keyFeatures: { touchscreen: true, instrumentCluster: true, navigation: true, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: true, cruiseControl: true, keylessEntry: true, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ['7" TFT", "MoveOS 5', "Voice Assistant"], connectivity: ["4G LTE", "Bluetooth 5.0", "Wi-Fi"], comfort: ["Multiple Riding Modes", "Reverse Mode"], technology: ["OTA Updates", "Drag Mode", "Track Mode", "AI Range Prediction"] },
    safety: { airbags: "N/A", abs: true, ebd: true, esc: false, tractionControl: true, tpms: true, hillHoldAssist: false, reverseCamera: false, parkingSensors: false, adasFeatures: ["Traction Control"], safetyRating: "N/A", additionalEquipment: ["ABS", "Cornering ABS", "Emergency Stop Signal"] },
    warranty: { vehicle: "3 Years", battery: "3 Years / 50,000 km", motor: "3 Years", roadsideAssistance: "3 Years" },
    pros: ["Industry-leading 579 km range (Pro)", "Insane 0–40 in 1.5 sec", "Affordable entry at ₹74,999", "Ola's MoveOS 5 ecosystem", "Cornering ABS"],
    cons: ["Deliveries may face delays", "Service network concerns", "Range varies heavily by riding mode"],
    metaTitle: "Ola Roadster Price 2025 – 579 km Range Electric Motorcycle | EV News India",
    metaDescription: "Ola Roadster price starts ₹74,999. 579 km range, 126 km/h top speed, 0–40 in 1.5 sec. Launch date and full specs.",
    focusKeyword: "Ola Roadster price",
    keywords: ["ola roadster", "ola electric motorcycle", "ola roadster price", "ola roadster range"],
    colors: [{ name: "Stellar Black", hexCode: "#1a1a1a", image: "" }, { name: "Porcelain White", hexCode: "#f5f5f0", image: "" }, { name: "Plasma Red", hexCode: "#c0392b", image: "" }, { name: "Graviton Grey", hexCode: "#6b7280", image: "" }],
  },
  {
    name: "Ola Roadster X",
    brand: "Ola Electric",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "ola-roadster-x",
    status: "published",
    featured: false,
    launchDate: new Date("2025-09-01"),
    shortDescription: "Ola's most affordable electric motorcycle with 200 km range, targeting daily commuters.",
    variants: [
      { name: "Roadster X 2.5 kWh", exShowroomPrice: "₹74,999",  onRoadPrice: "₹86,000", batteryCapacity: "2.5 kWh", range: "200 km", availabilityStatus: "Upcoming", features: ["Standard"] },
      { name: "Roadster X 3.5 kWh", exShowroomPrice: "₹99,999",  onRoadPrice: "₹1,14,000", batteryCapacity: "3.5 kWh", range: "320 km", availabilityStatus: "Upcoming", features: ["Extended Range", "MoveOS"] },
    ],
    performance: { batteryCapacity: "3.5 kWh", drivingRange: "320 km", power: "11 kW", peakPower: "20 kW", torque: "80 Nm", topSpeed: "124 km/h", acceleration: "2.8 sec (0–40 km/h)", driveType: "Chain Drive", batteryType: "Lithium-Ion NMC" },
    charging: { acChargingTime: "3.5 hrs", dcChargingTime: "1 hr (0–80%)", fastCharging: true, chargingPort: "CCS2" },
    specs: { length: "2000 mm", width: "820 mm", height: "1060 mm", wheelbase: "1410 mm", groundClearance: "180 mm", kerbWeight: "108 kg", seatingCapacity: "2", tyreType: "Tubeless", wheelSize: "17 inch Alloy" },
    keyFeatures: { touchscreen: true, instrumentCluster: true, navigation: true, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: true, cruiseControl: false, keylessEntry: false, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ['5" TFT Display', "MoveOS Lite"], connectivity: ["Bluetooth", "Wi-Fi"], comfort: ["Eco/City/Power Modes"], technology: ["OTA Updates", "Geo-Fencing"] },
    safety: { airbags: "N/A", abs: true, ebd: false, esc: false, tractionControl: false, tpms: false, hillHoldAssist: false, reverseCamera: false, parkingSensors: false, adasFeatures: [], safetyRating: "N/A", additionalEquipment: ["ABS", "Anti-Theft"] },
    warranty: { vehicle: "3 Years", battery: "3 Years / 50,000 km", motor: "3 Years", roadsideAssistance: "3 Years" },
    pros: ["Most affordable electric motorcycle at ₹74,999", "Good 200 km range", "Ola's MoveOS ecosystem", "ABS standard"],
    cons: ["Limited service network", "Deliveries pending", "Basic features on entry variant"],
    metaTitle: "Ola Roadster X Price 2025 – Upcoming Electric Motorcycle | EV News India",
    metaDescription: "Ola Roadster X price starts ₹74,999. 200 km range, 124 km/h top speed. Launch details and full specs.",
    focusKeyword: "Ola Roadster X price",
    keywords: ["ola roadster x", "ola electric bike", "ola roadster x price"],
    colors: [{ name: "Jet Black", hexCode: "#1a1a1a", image: "" }, { name: "Pearl White", hexCode: "#f5f5f5", image: "" }, { name: "Coral Glam", hexCode: "#e8735a", image: "" }],
  },
  {
    name: "Honda Activa Electric",
    brand: "Honda",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "honda-activa-electric",
    status: "published",
    featured: true,
    launchDate: new Date("2025-07-01"),
    shortDescription: "India's most awaited electric scooter — the iconic Activa goes electric with 102 km range.",
    variants: [
      { name: "Activa e: Standard", exShowroomPrice: "₹1,17,000", onRoadPrice: "₹1,35,000", batteryCapacity: "1.5 kWh", range: "102 km", availabilityStatus: "Upcoming", features: ["Swappable Battery", "Honda RoadSync"] },
    ],
    performance: { batteryCapacity: "1.5 kWh (×2 swappable)", drivingRange: "102 km", power: "6 kW", peakPower: "7.5 kW", torque: "22 Nm", topSpeed: "80 km/h", acceleration: "4.8 sec (0–40 km/h)", driveType: "Hub Motor", batteryType: "Lithium-Ion (Swappable)" },
    charging: { acChargingTime: "6 hrs per pack", dcChargingTime: "N/A", fastCharging: false, chargingPort: "Honda Smart Key" },
    specs: { length: "1868 mm", width: "713 mm", height: "1143 mm", wheelbase: "1280 mm", groundClearance: "171 mm", kerbWeight: "130 kg", seatingCapacity: "2", tyreType: "Tubeless", wheelSize: "12 inch Alloy" },
    keyFeatures: { touchscreen: false, instrumentCluster: true, navigation: true, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: false, cruiseControl: false, keylessEntry: true, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ["Digital Cluster", "Honda RoadSync App"], connectivity: ["Bluetooth", "Honda App"], comfort: ["Swappable Battery Packs", "Tall Windscreen"], technology: ["Honda Smart Key", "Battery Swap Network"] },
    safety: { airbags: "N/A", abs: false, ebd: false, esc: false, tractionControl: false, tpms: false, hillHoldAssist: false, reverseCamera: false, parkingSensors: false, adasFeatures: [], safetyRating: "N/A", additionalEquipment: ["CBS", "Honda Smart Key"] },
    warranty: { vehicle: "3 Years", battery: "3 Years / 50,000 km", motor: "3 Years", roadsideAssistance: "3 Years" },
    pros: ["Iconic Activa trust & brand value", "Swappable battery — no charging wait", "Honda dealer network across India", "Affordable pricing"],
    cons: ["Battery swap stations limited initially", "No fast charging", "Range lower than rivals"],
    metaTitle: "Honda Activa Electric Price 2025 – Launch Date & Specs | EV News India",
    metaDescription: "Honda Activa Electric price expected ₹1,17,000. 102 km range, swappable battery, Honda RoadSync. Launch 2025.",
    focusKeyword: "Honda Activa Electric price",
    keywords: ["honda activa electric", "activa electric price", "honda activa ev", "activa e price"],
    colors: [{ name: "Pearl Dusk Yellow", hexCode: "#f5c518", image: "" }, { name: "Matt Axis Grey", hexCode: "#6c757d", image: "" }, { name: "Pearl Igneous Black", hexCode: "#1a1a1a", image: "" }, { name: "Marble Pearl White", hexCode: "#f8f8f2", image: "" }],
  },
  {
    name: "TVS Creon",
    brand: "TVS Motor",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "tvs-creon",
    status: "published",
    featured: false,
    launchDate: new Date("2025-10-01"),
    shortDescription: "TVS's upcoming premium electric scooter concept inspired by racing, with 80 km real-world range.",
    variants: [
      { name: "Creon Standard", exShowroomPrice: "₹1,50,000", onRoadPrice: "₹1,72,000", batteryCapacity: "4.4 kWh", range: "80 km", availabilityStatus: "Upcoming", features: ["Race-Inspired Design", "SmartXonnect"] },
    ],
    performance: { batteryCapacity: "4.4 kWh", drivingRange: "80 km", power: "6 kW", peakPower: "12 kW", torque: "35 Nm", topSpeed: "100 km/h", acceleration: "2.9 sec (0–40 km/h)", driveType: "Belt Drive", batteryType: "Lithium-Ion NMC" },
    charging: { acChargingTime: "4 hrs", dcChargingTime: "N/A", fastCharging: false, chargingPort: "Type 2" },
    specs: { length: "1900 mm", width: "720 mm", height: "1130 mm", wheelbase: "1310 mm", groundClearance: "160 mm", kerbWeight: "120 kg", seatingCapacity: "2", tyreType: "Tubeless Radial", wheelSize: "14 inch Alloy" },
    keyFeatures: { touchscreen: true, instrumentCluster: true, navigation: true, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: true, cruiseControl: false, keylessEntry: true, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ['7" TFT", "SmartXonnect Pro'], connectivity: ["Bluetooth 5.0", "4G"], comfort: ["Sport + Eco Modes", "Race Ergonomics"], technology: ["OTA Updates", "Lean Angle Sensor", "Regen Braking"] },
    safety: { airbags: "N/A", abs: false, ebd: false, esc: false, tractionControl: false, tpms: false, hillHoldAssist: false, reverseCamera: false, parkingSensors: false, adasFeatures: [], safetyRating: "N/A", additionalEquipment: ["CBS", "Theft Alert"] },
    warranty: { vehicle: "3 Years", battery: "3 Years / 50,000 km", motor: "3 Years", roadsideAssistance: "3 Years" },
    pros: ["Stunning race-inspired design", "Strong TVS dealer network", "100 km/h top speed", "SmartXonnect features"],
    cons: ["Lower range at 80 km", "No fast charging", "Expected premium price"],
    metaTitle: "TVS Creon Electric Price 2025 – Launch Date & Specs | EV News India",
    metaDescription: "TVS Creon electric scooter expected price ₹1,50,000. 80 km range, 100 km/h top speed. Race-inspired design.",
    focusKeyword: "TVS Creon price",
    keywords: ["tvs creon", "tvs creon electric", "tvs creon price", "tvs upcoming scooter"],
    colors: [{ name: "Racing Red", hexCode: "#c0392b", image: "" }, { name: "Stealth Black", hexCode: "#1a1a1a", image: "" }, { name: "Arctic White", hexCode: "#f5f5f5", image: "" }],
  },
  {
    name: "Yamaha E01",
    brand: "Yamaha",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "yamaha-e01",
    status: "published",
    featured: false,
    launchDate: new Date("2025-12-01"),
    shortDescription: "Yamaha's upcoming electric scooter for India with 104 km range and premium Japanese engineering.",
    variants: [
      { name: "E01 Standard", exShowroomPrice: "₹1,30,000", onRoadPrice: "₹1,50,000", batteryCapacity: "3.5 kWh", range: "104 km", availabilityStatus: "Upcoming", features: ["Yamaha Smart Key", "Y-Connect App"] },
    ],
    performance: { batteryCapacity: "3.5 kWh", drivingRange: "104 km", power: "6.1 kW", peakPower: "9 kW", torque: "300 Nm", topSpeed: "90 km/h", acceleration: "4 sec (0–40 km/h)", driveType: "Hub Motor", batteryType: "Lithium-Ion" },
    charging: { acChargingTime: "3 hrs", dcChargingTime: "N/A", fastCharging: false, chargingPort: "Type 1" },
    specs: { length: "1870 mm", width: "740 mm", height: "1150 mm", wheelbase: "1295 mm", groundClearance: "135 mm", kerbWeight: "105 kg", seatingCapacity: "2", tyreType: "Tubeless", wheelSize: "13 inch Alloy" },
    keyFeatures: { touchscreen: false, instrumentCluster: true, navigation: false, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: false, cruiseControl: false, keylessEntry: true, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ["Digital Cluster", "Y-Connect App"], connectivity: ["Bluetooth", "Yamaha App"], comfort: ["D / S Riding Modes", "Flat Floorboard"], technology: ["Regen Braking", "Smart Key System"] },
    safety: { airbags: "N/A", abs: false, ebd: false, esc: false, tractionControl: false, tpms: false, hillHoldAssist: false, reverseCamera: false, parkingSensors: false, adasFeatures: [], safetyRating: "N/A", additionalEquipment: ["CBS", "Smart Key Anti-Theft"] },
    warranty: { vehicle: "3 Years", battery: "3 Years / 50,000 km", motor: "3 Years", roadsideAssistance: "2 Years" },
    pros: ["Trusted Yamaha brand and quality", "Lightweight at 105 kg", "Fast 3-hour AC charging", "Smart Key system"],
    cons: ["No navigation built-in", "Moderate range", "Service centres limited for EV"],
    metaTitle: "Yamaha E01 Electric Scooter Price 2025 – Launch Date | EV News India",
    metaDescription: "Yamaha E01 electric scooter expected price ₹1,30,000. 104 km range, 90 km/h, Yamaha quality.",
    focusKeyword: "Yamaha E01 price",
    keywords: ["yamaha e01", "yamaha electric scooter", "yamaha e01 price", "yamaha ev india"],
    colors: [{ name: "Metallic Blue", hexCode: "#1a3a8f", image: "" }, { name: "Matte Black", hexCode: "#2d2d2d", image: "" }, { name: "Pearl White", hexCode: "#f5f5f5", image: "" }],
  },
  {
    name: "Bounce Infinity E1 Pro",
    brand: "Bounce Infinity",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "bounce-infinity-e1-pro",
    status: "published",
    featured: false,
    launchDate: new Date("2025-09-15"),
    shortDescription: "Upcoming premium variant of Bounce Infinity with swappable battery and 120 km range.",
    variants: [
      { name: "E1 Pro", exShowroomPrice: "₹1,10,000", onRoadPrice: "₹1,27,000", batteryCapacity: "2 kWh", range: "120 km", availabilityStatus: "Upcoming", features: ["Swappable Battery", "Bounce Network Access"] },
    ],
    performance: { batteryCapacity: "2 kWh (swappable)", drivingRange: "120 km", power: "3.5 kW", peakPower: "5 kW", torque: "85 Nm", topSpeed: "65 km/h", acceleration: "5.5 sec (0–40 km/h)", driveType: "Hub Motor", batteryType: "Lithium-Ion (Swappable)" },
    charging: { acChargingTime: "4 hrs (home) / 2 min (swap)", dcChargingTime: "N/A", fastCharging: false, chargingPort: "Bounce Swap Station" },
    specs: { length: "1830 mm", width: "680 mm", height: "1120 mm", wheelbase: "1255 mm", groundClearance: "165 mm", kerbWeight: "90 kg", seatingCapacity: "2", tyreType: "Tubeless", wheelSize: "12 inch Alloy" },
    keyFeatures: { touchscreen: false, instrumentCluster: true, navigation: false, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: false, cruiseControl: false, keylessEntry: false, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ["Digital Cluster", "Bounce App"], connectivity: ["Bluetooth"], comfort: ["Lightweight Body", "Easy Battery Swap"], technology: ["Swappable Battery Tech", "Battery Subscription Model"] },
    safety: { airbags: "N/A", abs: false, ebd: false, esc: false, tractionControl: false, tpms: false, hillHoldAssist: false, reverseCamera: false, parkingSensors: false, adasFeatures: [], safetyRating: "N/A", additionalEquipment: ["CBS"] },
    warranty: { vehicle: "3 Years", battery: "3 Years", motor: "3 Years", roadsideAssistance: "2 Years" },
    pros: ["Lightest scooter at 90 kg", "2-minute battery swap", "Flexible subscription model", "Affordable pricing"],
    cons: ["Swap stations limited", "Lower top speed", "Basic features"],
    metaTitle: "Bounce Infinity E1 Pro Price 2025 – Swappable Battery Scooter | EV News India",
    metaDescription: "Bounce Infinity E1 Pro expected price ₹1,10,000. 120 km range, 2-minute battery swap. Lightweight electric scooter.",
    focusKeyword: "Bounce Infinity E1 Pro price",
    keywords: ["bounce infinity e1 pro", "bounce electric scooter", "bounce swap battery scooter"],
    colors: [{ name: "Coral Red", hexCode: "#e8735a", image: "" }, { name: "Matte Black", hexCode: "#2d2d2d", image: "" }, { name: "Pearl White", hexCode: "#f8f8f2", image: "" }],
  },
  {
    name: "Hero Surge S32",
    brand: "Hero Electric",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "hero-surge-s32",
    status: "published",
    featured: false,
    launchDate: new Date("2025-11-01"),
    shortDescription: "Hero's upcoming premium electric scooter with 165 km range and fast charging, successor to Vida V1.",
    variants: [
      { name: "Surge S32 Standard", exShowroomPrice: "₹1,35,000", onRoadPrice: "₹1,55,000", batteryCapacity: "3.94 kWh", range: "165 km", availabilityStatus: "Upcoming", features: ["Fast Charging", "Vida App v2"] },
    ],
    performance: { batteryCapacity: "3.94 kWh", drivingRange: "165 km", power: "7 kW", peakPower: "12 kW", torque: "28 Nm", topSpeed: "90 km/h", acceleration: "3.5 sec (0–40 km/h)", driveType: "Hub Motor", batteryType: "Lithium-Ion NMC" },
    charging: { acChargingTime: "5 hrs", dcChargingTime: "55 min (0–80%)", fastCharging: true, chargingPort: "CCS2" },
    specs: { length: "1870 mm", width: "740 mm", height: "1165 mm", wheelbase: "1340 mm", groundClearance: "168 mm", kerbWeight: "130 kg", seatingCapacity: "2", tyreType: "Tubeless", wheelSize: "12 inch Alloy" },
    keyFeatures: { touchscreen: true, instrumentCluster: true, navigation: true, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: true, cruiseControl: false, keylessEntry: true, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ['7" TFT", "Vida App v2', "Navigation"], connectivity: ["Bluetooth", "Wi-Fi", "4G"], comfort: ["Reverse Mode", "Walk Assist"], technology: ["OTA Updates", "Fast DC Charging", "Geo-Fencing"] },
    safety: { airbags: "N/A", abs: false, ebd: false, esc: false, tractionControl: false, tpms: false, hillHoldAssist: true, reverseCamera: false, parkingSensors: false, adasFeatures: [], safetyRating: "N/A", additionalEquipment: ["CBS", "Crash Alert"] },
    warranty: { vehicle: "3 Years", battery: "3 Years / 50,000 km", motor: "3 Years", roadsideAssistance: "3 Years" },
    pros: ["Fast DC charging", "165 km range", "Hero's massive dealer network", "Improved Vida App v2"],
    cons: ["Expected higher price", "Details still unconfirmed", "Wait for actual launch"],
    metaTitle: "Hero Surge S32 Price 2025 – Upcoming Electric Scooter | EV News India",
    metaDescription: "Hero Surge S32 expected price ₹1,35,000. 165 km range, fast DC charging, Hero dealer network.",
    focusKeyword: "Hero Surge S32 price",
    keywords: ["hero surge s32", "hero upcoming electric scooter", "hero surge price"],
    colors: [{ name: "Matte Teal", hexCode: "#008080", image: "" }, { name: "Radiant Red", hexCode: "#c0392b", image: "" }, { name: "Stealth Black", hexCode: "#1a1a1a", image: "" }],
  },
  {
    name: "Ather 450 Apex",
    brand: "Ather Energy",
    vehicleType: "bike",
    category: "upcoming",
    availability: "upcoming",
    slug: "ather-450-apex",
    status: "published",
    featured: false,
    launchDate: new Date("2026-01-01"),
    shortDescription: "Ather's upcoming flagship electric scooter with highest performance — the Apex edition.",
    variants: [
      { name: "450 Apex", exShowroomPrice: "₹1,99,999", onRoadPrice: "₹2,30,000", batteryCapacity: "3.7 kWh", range: "150 km", availabilityStatus: "Upcoming", features: ["Warp + Pro Mode", "Full Carbon Fibre Body", "Limited Edition"] },
    ],
    performance: { batteryCapacity: "3.7 kWh", drivingRange: "150 km", power: "7.5 kW", peakPower: "11 kW", torque: "26 Nm", topSpeed: "100 km/h", acceleration: "2.9 sec (0–40 km/h)", driveType: "Belt Drive", batteryType: "Lithium-Ion NMC" },
    charging: { acChargingTime: "4 hrs", dcChargingTime: "45 min (0–80%)", fastCharging: true, chargingPort: "Ather Dot / Type 2" },
    specs: { length: "1860 mm", width: "695 mm", height: "1140 mm", wheelbase: "1289 mm", groundClearance: "178 mm", kerbWeight: "104 kg", seatingCapacity: "2", tyreType: "Tubeless Radial Performance", wheelSize: "12 inch Alloy" },
    keyFeatures: { touchscreen: true, instrumentCluster: true, navigation: true, bluetooth: true, androidAuto: false, appleCarPlay: false, otaUpdates: true, cruiseControl: false, keylessEntry: true, sunroof: false, ventilatedSeats: false, wirelessCharging: false },
    features: { infotainment: ['7" AMOLED Display', "Ather AI", "Navigation Pro"], connectivity: ["Bluetooth 5.2", "Wi-Fi 6", "4G"], comfort: ["Auto Hold", "Apex Ergonomics"], technology: ["Warp Mode", "Pro Track Mode", "OTA Updates", "Lean Data Analytics"] },
    safety: { airbags: "N/A", abs: false, ebd: false, esc: false, tractionControl: true, tpms: true, hillHoldAssist: true, reverseCamera: false, parkingSensors: false, adasFeatures: ["Traction Control"], safetyRating: "N/A", additionalEquipment: ["CBS", "Traction Control", "Crash Detection"] },
    warranty: { vehicle: "3 Years", battery: "3 Years / 30,000 km", motor: "3 Years", roadsideAssistance: "3 Years" },
    pros: ["Ather's highest performance scooter", "Carbon fibre body – ultra lightweight", "0–40 in 2.9 sec", "100 km/h top speed", "Track mode analytics"],
    cons: ["Very expensive at ₹1.99 Lakh", "Limited edition — limited units", "Range same as 450X"],
    metaTitle: "Ather 450 Apex Price 2026 – Flagship Electric Scooter | EV News India",
    metaDescription: "Ather 450 Apex expected price ₹1,99,999. 100 km/h top speed, carbon fibre body, Warp + Pro Mode. Limited edition.",
    focusKeyword: "Ather 450 Apex price",
    keywords: ["ather 450 apex", "ather apex scooter", "ather fastest scooter", "ather flagship"],
    colors: [{ name: "Apex Black Carbon", hexCode: "#1a1a1a", image: "" }, { name: "Apex White", hexCode: "#f0f0ec", image: "" }],
  },
];

/* ── Main ─────────────────────────────────────────────────────────── */
const client = new MongoClient(URI);
await client.connect();
console.log("✓ Connected to MongoDB →", DB);

const col = client.db(DB).collection("vehicles");
let inserted = 0, updated = 0, failed = 0;

for (const bike of upcomingBikes) {
  try {
    const res = await col.updateOne(
      { slug: bike.slug },
      { $set: { ...bike, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date(), views: 0 } },
      { upsert: true }
    );
    if (res.upsertedCount > 0) { inserted++; console.log(`  ✓ Inserted: ${bike.name}`); }
    else if (res.modifiedCount > 0) { updated++; console.log(`  ↻ Updated:  ${bike.name}`); }
    else console.log(`  = Unchanged: ${bike.name}`);
  } catch (e) { failed++; console.error(`  ✗ Failed: ${bike.name} — ${e.message}`); }
}

const total = await col.countDocuments({ vehicleType: "bike", category: "upcoming" });
console.log(`\n╔══════════════════════════════════════╗`);
console.log(`║  UPCOMING BIKES SEED DONE            ║`);
console.log(`║  Inserted: ${String(inserted).padEnd(27)}║`);
console.log(`║  Updated:  ${String(updated).padEnd(27)}║`);
console.log(`║  Failed:   ${String(failed).padEnd(27)}║`);
console.log(`║  Total upcoming bikes in DB: ${String(total).padEnd(10)}║`);
console.log(`╚══════════════════════════════════════╝`);
await client.close();
