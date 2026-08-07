import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title:  { default: "Admin – EV Radar", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
