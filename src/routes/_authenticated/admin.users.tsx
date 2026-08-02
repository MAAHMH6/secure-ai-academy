import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, AdminCard } from "@/components/admin/AdminPage";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

type Role = "admin" | "instructor" | "student";
const ROLES: Role[] = ["admin", "instructor", "student"];

function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");

  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }, { data: enrolls }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("enrollments").select("user_id"),
      ]);
      return { profiles: profiles ?? [], roles: roles ?? [], enrolls: enrolls ?? [] };
    },
  });

  const rolesOf = (id: string) => (data?.roles ?? []).filter((r) => r.user_id === id).map((r) => r.role as Role);

  async function toggleRole(userId: string, role: Role, has: boolean) {
    if (has) await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    else await supabase.from("user_roles").insert({ user_id: userId, role });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const rows = (data?.profiles ?? []).filter((p) => {
    const term = q.trim().toLowerCase();
    const matches =
      !term ||
      (p.full_name ?? "").toLowerCase().includes(term) ||
      (p.business_email ?? "").toLowerCase().includes(term) ||
      (p.phone ?? "").includes(term);
    const roleOk = filter === "all" || rolesOf(p.id).includes(filter);
    return matches && roleOk;
  });

  return (
    <>
      <PageHeader eyebrow="Users" title="Users & roles" description="Search every account and grant admin, instructor, or student roles." />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone"
            className="w-full rounded-md bg-surface py-2 pr-3 pl-9 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
          />
        </div>
        {(["all", ...ROLES] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`rounded-full px-3 py-1.5 text-xs capitalize ring-1 ${
              filter === r ? "bg-brand/10 text-brand ring-brand/30" : "bg-surface text-muted-foreground ring-hairline"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <AdminCard className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            <tr className="border-b border-hairline">
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Contact</th>
              <th className="p-4 text-left">Joined</th>
              <th className="p-4 text-right">Enrollments</th>
              <th className="p-4 text-left">Roles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((p) => {
              const mine = rolesOf(p.id);
              return (
                <tr key={p.id}>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{p.full_name ?? "Unnamed"}</div>
                    <div className="text-[11px] text-muted-foreground">{p.headline ?? p.interested_domain ?? "—"}</div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    <div>{p.business_email ?? "—"}</div>
                    <div>{p.phone ? `${p.country_code ?? ""} ${p.phone}` : "—"}</div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right text-foreground">
                    {(data?.enrolls ?? []).filter((e) => e.user_id === p.id).length}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {ROLES.map((r) => {
                        const has = mine.includes(r);
                        return (
                          <button
                            key={r}
                            onClick={() => toggleRole(p.id, r, has)}
                            className={`rounded-full px-2.5 py-1 text-[11px] capitalize ring-1 transition-colors ${
                              has ? "bg-brand/10 text-brand ring-brand/30" : "text-muted-foreground ring-hairline hover:text-foreground"
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No users match.</p> : null}
      </AdminCard>
    </>
  );
}