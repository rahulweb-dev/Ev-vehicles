import { SITE_URL } from "@/app/layout";
import EVvsPetrolApp from "./EVvsPetrolApp";

export const metadata = {
  title: "EV vs Petrol Cost Calculator India 2026 – Monthly Savings & Break-even | EV News India",
  description: "Calculate how much you save by switching from petrol to electric vehicle in India. Get monthly savings, break-even point and 10-year cost comparison. Free EV savings calculator.",
  keywords: "ev vs petrol calculator india, ev savings calculator, electric vehicle vs petrol cost india, ev break even point india, petrol to ev savings 2026",
  alternates: { canonical: `${SITE_URL}/ev-vs-petrol` },
  openGraph: {
    title: "EV vs Petrol Cost Calculator India 2026 – Monthly Savings & Break-even",
    description: "Compare total cost of ownership between electric and petrol vehicles in India. Calculate monthly savings, break-even point and 10-year net savings.",
    url: `${SITE_URL}/ev-vs-petrol`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV+vs+Petrol+Calculator+India&subtitle=Monthly+Savings+%26+Break-even+Point&tag=tool&type=page`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV vs Petrol Savings Calculator India 2026",
    description: "Find out how much you save monthly by switching to an EV — and when you break even on the higher cost.",
  },
};

export default function EVvsPetrolPage() {
  return <EVvsPetrolApp />;
}
