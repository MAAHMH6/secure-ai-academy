import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", search: { mode: "login", redirect: "/admin" } });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <PageShell>
      <div className="mx-auto flex w-full max-w-[100rem]">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <AdminMobileNav />
          <div className="px-6 py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </PageShell>
  );
}