import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden bg-transparent">
          <AppSidebar />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
