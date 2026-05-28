import CompareClient from "./CompareClient";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "Compare Electric Vehicles – Cars & Bikes Side by Side | EV News India",
  description:
    "Compare electric cars and bikes side by side. Check specs, range, motor, price and features of top EVs in India.",
  alternates: { canonical: `${SITE_URL}/compare` },
};

export default function ComparePage() {
  return <CompareClient />;
}
