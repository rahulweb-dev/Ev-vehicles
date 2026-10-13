import Link from "next/link";
import OfflineClient from "./OfflineClient";

export const metadata = {
  title: "You're Offline",
  robots: { index: false },
};

export default function OfflinePage() {
  return <OfflineClient />;
}
