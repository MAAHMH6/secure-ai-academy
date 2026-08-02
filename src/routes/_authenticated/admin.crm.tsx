import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, AdminCard } from "@/components/admin/AdminPage";
import { Download, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/crm")({
  component: AdminCrm,
});

function AdminCrm() {
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-crm"],
    queryFn: async () => {
      const [{ data: profiles }, { data: regs }, { data: enrolls }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("masterclass_registrations").select("*").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("user_id, progress_percent"),
      ]);
      return { profiles: profiles ?? [], regs: regs ?? [], enrolls: enrolls ?? [] };
    },
  });

  const rows = (data?.profiles ?? []).map((p) => {
    const reg = (data?.regs ?? []).find((r) => r.user_id === p.id);
    const mine = (data?.enrolls ?? []).filter((e) => e.user_id === p.id);
    return {
      id: p.id,
      name: p.full_name ?? reg?.full_name ?? "Unnamed",
      email: p.business_email ?? reg?.email ?? "—",
      phone: p.phone ?? reg?.phone ?? null,
      countryCode: p.country_code ?? reg?.country_code ?? "",
      country: p.country ?? reg?.country ?? "—",
      source: p.lead_source ?? (reg ? "Masterclass" : "Direct signup"),
      experience: p.experience_level ?? reg?.experience_level ?? "—",
      domain: p.interested_domain ?? reg?.interested_domain ?? "—",
      roleTitle: p.current_role_title ?? reg?.current_role_title ?? "—",
      enrollments: mine.length,
      progress: mine.length ? Math.round(mine.reduce((a, e) => a + (e.progress_percent ?? 0), 0) / mine.length) : 0,
      created: p.created_at,
      lastLogin: p.last_login_at,
    };
  });

  const term = q.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.domain.toLowerCase().includes(term) ||
      r.country.toLowerCase().includes(term),
  );

  function exportCsv() {
    const head = ["Name", "Email", "Phone", "Country", "Lead source", "Experience", "Domain", "Role", "Enrollments", "Avg progress", "Signed up"];
    const body = filtered.map((r) =>
      [r.name, r.email, r.phone ? `${r.countryCode} ${r.phone}` : "", r.country, r.source, r.experience, r.domain, r.roleTitle, r.enrollments, `${r.progress}%`, new Date(r.created).toISOString().slice(0, 10)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crm-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader eyebrow="CRM" title="Leads & students" description="Every account with lead source, country, experience, interested domain, and learning progress." />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads"
            className="w-full rounded-md bg-surface py-2 pr-3 pl-9 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
          />
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <AdminCard className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            <tr className="border-b border-hairline">
              <th className="p-4 text-left">Lead</th>
              <th className="p-4 text-left">Contact</th>
              <th className="p-4 text-left">Country</th>
              <th className="p-4 text-left">Source</th>
              <th className="p-4 text-left">Experience</th>
              <th className="p-4 text-left">Domain</th>
              <th className="p-4 text-right">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="p-4">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.roleTitle}</div>
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  <div>{r.email}</div>
                  <div>{r.phone ? `${r.countryCode} ${r.phone}` : "—"}</div>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{r.country}</td>
                <td className="p-4 text-xs text-brand">{r.source}</td>
                <td className="p-4 text-xs text-muted-foreground capitalize">{r.experience}</td>
                <td className="p-4 text-xs text-muted-foreground">{r.domain}</td>
                <td className="p-4 text-right">
                  <div className="text-foreground">{r.progress}%</div>
                  <div className="text-[11px] text-muted-foreground">{r.enrollments} enrolled</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No leads yet.</p> : null}
      </AdminCard>
    </>
  );
}