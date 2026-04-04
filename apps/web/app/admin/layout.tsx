import type { ReactNode } from "react";
import { cookies } from "next/headers";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const token = cookies().get("admin_token")?.value;

  if (!token) {
    return <section className="section">{children}</section>;
  }

  return (
    <section className="section">
      <div className="container admin-shell">
        <AdminSidebar />
        <div className="admin-content">{children}</div>
      </div>
    </section>
  );
}
