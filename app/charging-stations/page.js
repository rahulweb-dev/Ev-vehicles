import ChargingStationFinder from "@/components/ChargingStationFinder";
import { SITE_URL } from "@/app/layout";

export const metadata = {
  title: "EV Charging Stations Near Me – Find Charging Points in India",
  description: "Find electric vehicle charging stations near you across India. Filter by connector type, network, and availability.",
  alternates: { canonical: `${SITE_URL}/charging-stations` },
};

export default function ChargingStationsPage() {
  return <ChargingStationFinder />;
}
