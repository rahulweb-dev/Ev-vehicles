import SavedArticles from "@/components/SavedArticles";

export const metadata = {
  title: "Saved Articles – EV Radar",
  description: "Your saved EV news articles on EV Radar.",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return <SavedArticles />;
}
