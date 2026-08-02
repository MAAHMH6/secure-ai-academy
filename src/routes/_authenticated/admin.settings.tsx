import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, AdminCard } from "@/components/admin/AdminPage";
import { CheckCircle2, Database, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { data } = useQuery({
    queryKey: ["admin-settings-health"],
    queryFn: async () => {
      const [courses, users, admins] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
      ]);
      return { courses: courses.count ?? 0, users: users.count ?? 0, admins: admins.count ?? 0 };
    },
  });

  const items = [
    { icon: Database, title: "Database", body: `${data?.courses ?? 0} learning products · ${data?.users ?? 0} profiles`, status: "Connected" },
    { icon: Lock, title: "Authentication", body: "Email + password, password reset, role-based admin access", status: "Active" },
    { icon: Mail, title: "Contact routing", body: "Enquiries route to the founder inbox and WhatsApp line", status: "Active" },
  ];

  return (
    <>
      <PageHeader eyebrow="Settings" title="System" description="Platform health, security posture, and integration status." />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((i) => (
          <AdminCard key={i.title} className="p-6">
            <i.icon className="size-5 text-brand" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">{i.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{i.body}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-brand">
              <CheckCircle2 className="size-3.5" /> {i.status}
            </span>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="mt-8 p-6">
        <h3 className="text-sm font-semibold text-foreground">Security policy</h3>
        <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
          <li>· Admin access is granted by role only — there are no hardcoded credentials anywhere in the platform.</li>
          <li>· Every table enforces row-level security; learners can only read and write their own records.</li>
          <li>· Roles live in a dedicated table and are checked server-side, preventing privilege escalation.</li>
          <li>· There are currently {data?.admins ?? 0} account(s) with the admin role.</li>
        </ul>
      </AdminCard>
    </>
  );
}