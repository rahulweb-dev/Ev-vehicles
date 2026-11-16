import BudgetGuidePage, { guideMetadata } from "@/components/guides/BudgetGuidePage";

// Data-driven guide: list, highlights and FAQs are computed from live vehicle data (lib/budgetGuides.js).
export const revalidate = 3600;

const KEY = "electric-cars-under-20-lakh";

export async function generateMetadata() {
  return guideMetadata(KEY);
}

export default function Page() {
  return <BudgetGuidePage guideKey={KEY} />;
}
