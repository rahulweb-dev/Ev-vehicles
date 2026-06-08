import CompareClient from "./CompareClient";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "Compare Electric Vehicles – Cars & Bikes Side by Side | EV News India",
  description:
    "Compare electric cars and bikes side by side. Check specs, range, motor, price and features of top EVs in India.",
  alternates: { canonical: `${SITE_URL}/compare` },
};

export default async function ComparePage({ searchParams }) {
  const sp = await searchParams;
  return <CompareClient initialV0={sp?.v0 || null} initialV1={sp?.v1 || null} />;
}
