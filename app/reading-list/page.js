// Pure localStorage page — Googlebot sees only a spinner, so noindex prevents
// this from being flagged as low-value content in AdSense review.
export const metadata = {
  title: "Reading List",
  robots: { index: false, follow: false },
};

import ReadingListClient from "./ReadingListClient";

export default function ReadingListPage() {
  return <ReadingListClient />;
}
