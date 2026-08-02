import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, AdminCard } from "@/components/admin/AdminPage";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [{ data: profiles }, { data: courses }, { data: enrolls }, { data: certs }, { data: regs }] =
        await Promise.all([
          supabase.from("profiles").select("id, created_at, country, experience_level, interested_domain, lead_source"),
          supabase.from("courses").select("id, title, kind, price_cents, published"),
          supabase.from("enrollments").select("course_id, user_id, progress_percent, enrolled_at"),
          supabase.from("certificates").select("course_id"),
          supabase.from("masterclass_registrations").select("id, created_at, heard_from"),
        ]);
      return {
        profiles: profiles ?? [],
        courses: courses ?? [],
        enrolls: enrolls ?? [],
        certs: certs ?? [],
        regs: regs ?? [],
      };
    },
  });

  const profiles = data?.profiles ?? [];
  const enrolls = data?.enrolls ?? [];
  const courses = data?.courses ?? [];

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const signups = profiles.filter((p) => {
      const t = new Date(p.created_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    const enrollments = enrolls.filter((e) => {
      const t = new Date(e.enrolled_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    return { label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), signups, enrollments };
  });
  const peak = Math.max(1, ...days.map((d) => Math.max(d.signups, d.enrollments)));

  const activeLearners = new Set(enrolls.map((e) => e.user_id)).size;
  const avgProgress = enrolls.length
    ? Math.round(enrolls.reduce((a, e) => a + (e.progress_percent ?? 0), 0) / enrolls.length)
    : 0;
  const revenue = enrolls.reduce((sum, e) => {
    const c = courses.find((x) => x.id === e.course_id);
    return sum + (c ? c.price_cents / 100 : 0);
  }, 0);

  const byCourse = courses
    .map((c) => {
      const rows = enrolls.filter((e) => e.course_id === c.id);
      return {
        ...c,
        enrolled: rows.length,
        avg: rows.length ? Math.round(rows.reduce((a, e) => a + (e.progress_percent ?? 0), 0) / rows.length) : 0,
        issued: (data?.certs ?? []).filter((x) => x.course_id === c.id).length,
      };
    })
    .sort((a, b) => b.enrolled - a.enrolled);

  function breakdown(key: "country" | "experience_level" | "interested_domain" | "lead_source") {
    const map = new Map<string, number>();
    for (const p of profiles) {
      const v = (p[key] as string | null) ?? "Unknown";
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }

  const stats = [
    { k: "Total users", v: profiles.length },
    { k: "Active learners", v: activeLearners },
    { k: "Enrollments", v: enrolls.length },
    { k: "Masterclass leads", v: (data?.regs ?? []).length },
    { k: "Avg progress", v: `${avgProgress}%` },
    { k: "Catalog value", v: `$${revenue.toLocaleString()}` },
  ];

  return (
    <>
      <PageHeader eyebrow="Overview" title="Analytics" description="Signups, enrollments, completion and lead-source telemetry." />

      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <AdminCard key={s.k} className="p-5">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{s.k}</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{s.v}</div>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Last 14 days</h2>
          <div className="flex gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-brand" /> Signups</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-brand/35" /> Enrollments</span>
          </div>
        </div>
        <div className="mt-6 flex h-40 items-end gap-2">
          {days.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-32 w-full items-end justify-center gap-0.5">
                <div className="w-1/2 rounded-t bg-brand" style={{ height: `${(d.signups / peak) * 100}%` }} />
                <div className="w-1/2 rounded-t bg-brand/35" style={{ height: `${(d.enrollments / peak) * 100}%` }} />
              </div>
              <span className="text-[9px] text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {([
          ["Countries", "country"],
          ["Experience level", "experience_level"],
          ["Interested domain", "interested_domain"],
          ["Lead source", "lead_source"],
        ] as const).map(([label, key]) => (
          <AdminCard key={key} className="p-6">
            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
            <ul className="mt-4 space-y-2">
              {breakdown(key).map(([name, n]) => (
                <li key={name} className="flex items-center gap-3 text-xs">
                  <span className="w-40 truncate text-muted-foreground">{name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${(n / Math.max(1, profiles.length)) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right font-medium text-foreground">{n}</span>
                </li>
              ))}
            </ul>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="mt-8">
        <div className="border-b border-hairline p-5">
          <h2 className="text-sm font-semibold text-foreground">Per-product performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              <tr className="border-b border-hairline">
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-right">Enrolled</th>
                <th className="p-4 text-right">Avg progress</th>
                <th className="p-4 text-right">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {byCourse.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-medium text-foreground">{c.title}</td>
                  <td className="p-4 text-xs text-muted-foreground capitalize">{c.kind}</td>
                  <td className="p-4 text-right text-foreground">{c.enrolled}</td>
                  <td className="p-4 text-right text-muted-foreground">{c.avg}%</td>
                  <td className="p-4 text-right text-muted-foreground">{c.issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  );
}