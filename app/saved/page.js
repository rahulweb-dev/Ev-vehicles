import SavedArticles from "@/components/SavedArticles";

export const metadata = {
  title: "Saved Articles – EV News India",
  description: "Your saved EV news articles on EV News India.",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return <SavedArticles />;
}
