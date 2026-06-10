import EVSavingsCalc from "@/components/EVSavingsCalc";
import { SITE_URL } from "@/app/layout";

export const metadata = {
  title: "EV Savings Calculator – How Much Will You Save by Switching to Electric?",
  description: "Calculate your monthly and yearly savings by switching from a petrol/diesel car to an electric vehicle. Compare fuel costs vs charging costs in India.",
  alternates: { canonical: `${SITE_URL}/ev-savings-calculator` },
};

export default function EVSavingsPage() {
  return <EVSavingsCalc />;
}
