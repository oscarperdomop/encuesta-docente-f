import { Outlet } from "react-router-dom";
import USCOHeader from "@/components/USCOHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <USCOHeader
      subtitle="Panel de administración"
      containerClass="max-w-[1200px]"
      showAdminShortcut={false} // ya estamos en /admin
    >
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <aside>
          <AdminSidebar />
        </aside>
        <section className="min-h-[60vh]">
          <Outlet />
        </section>
      </div>
    </USCOHeader>
  );
}
