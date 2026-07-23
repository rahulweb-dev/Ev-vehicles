import { SITE_URL } from "@/app/layout";
import EMICalculatorApp from "./EMICalculatorApp";

export const metadata = {
  title: "EV EMI Calculator India 2026 – Electric Vehicle Loan Calculator | EV News India",
  description: "Calculate your electric vehicle EMI instantly. Enter EV price, down payment, loan tenure and interest rate to get monthly EMI, total interest and amortization schedule. Free EV loan calculator India.",
  keywords: "ev emi calculator india, electric vehicle loan calculator, ev loan emi 2026, car emi calculator india, ev finance calculator",
  alternates: { canonical: `${SITE_URL}/emi-calculator` },
  openGraph: {
    title: "EV EMI Calculator India 2026 – Free Electric Vehicle Loan Calculator",
    description: "Calculate your monthly EV loan EMI, total interest and repayment schedule instantly. Supports all electric cars and bikes in India.",
    url: `${SITE_URL}/emi-calculator`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV+EMI+Calculator+India+2026&subtitle=Monthly+EMI+%7C+Interest+%7C+Amortization&tag=tool&type=page`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV EMI Calculator India 2026",
    description: "Free EV loan EMI calculator. Calculate monthly payment, total interest and full amortization schedule.",
  },
};

export default function EMICalculatorPage() {
  return <EMICalculatorApp />;
}
