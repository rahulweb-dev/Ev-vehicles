import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = { title: { default: "Admin – EV News India", template: "%s | Admin" } };

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
