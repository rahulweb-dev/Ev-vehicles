import { SITE_URL } from "@/app/layout";
import EVSalesAdminPanel from "./EVSalesAdminPanel";

export const metadata = {
  title: "EV Sales Admin – Manage Sales Data",
  robots: { index: false, follow: false },
};

export default function EVSalesAdminPage() {
  return <EVSalesAdminPanel apiBase={`${SITE_URL}/api/ev-sales`} />;
}
