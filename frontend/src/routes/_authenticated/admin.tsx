import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    // Query profiles table to verify super_admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "super_admin") {
      // Redirect regular users back to workspace dashboard
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#fafafa]">
        <AdminSidebar />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-[#fafafa]">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
