import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/admin/AdminPage";
import { BookOpen, FileText, Users, KeyRound, UserCog } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminHome,
});

function AdminHome() {
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [users, courses, enrollments, certs, blogs, recentSignups] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since),
      ]);
      return {
        users: users.count ?? 0,
        courses: courses.count ?? 0,
        enrollments: enrollments.count ?? 0,
        certs: certs.count ?? 0,
        blogs: blogs.count ?? 0,
        recentSignups: recentSignups.count ?? 0,
      };
    },
  });

  const { data: recentCourses = [] } = useQuery({
    queryKey: ["admin-recent-courses"],
    queryFn: async () =>
      (await supabase.from("courses").select("id, title, published, level, lesson_count, price_cents").order("created_at", { ascending: false }).limit(10)).data ?? [],
  });

  const { data: courseAnalytics = [] } = useQuery({
    queryKey: ["admin-course-analytics"],
    queryFn: async () => {
      const [{ data: courses }, { data: enrolls }, { data: certs }] = await Promise.all([
        supabase.from("courses").select("id, title, price_cents, published"),
        supabase.from("enrollments").select("course_id, progress_percent"),
        supabase.from("certificates").select("course_id"),
      ]);
      return (courses ?? []).map((c) => {
        const rows = (enrolls ?? []).filter((e) => e.course_id === c.id);
        const completed = rows.filter((e) => (e.progress_percent ?? 0) >= 100).length;
        const issued = (certs ?? []).filter((x) => x.course_id === c.id).length;
        const avg = rows.length ? Math.round(rows.reduce((a, e) => a + (e.progress_percent ?? 0), 0) / rows.length) : 0;
        return { ...c, enrolled: rows.length, completed, issued, avg, revenue: (rows.length * c.price_cents) / 100 };
      }).sort((a, b) => b.enrolled - a.enrolled);
    },
  });

  const stats = [
    { k: "Total users", v: counts?.users ?? "—" },
    { k: "Signups (30d)", v: counts?.recentSignups ?? "—" },
    { k: "Courses", v: counts?.courses ?? "—" },
    { k: "Enrollments", v: counts?.enrollments ?? "—" },
    { k: "Certificates issued", v: counts?.certs ?? "—" },
    { k: "Blog posts", v: counts?.blogs ?? "—" },
  ];

  return (
    <PageShell>
      <PageHeader eyebrow="Admin Console" title="Command Center" description="LMS operations, catalog management, and org-wide telemetry." />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.k} className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
                <div className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">{s.k}</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/admin/courses" className="group flex items-start gap-3 rounded-xl bg-surface p-5 ring-1 ring-hairline hover:ring-brand/40">
              <BookOpen className="size-5 text-brand" />
              <div>
                <div className="text-sm font-semibold text-foreground group-hover:text-brand">Manage courses & certifications</div>
                <div className="mt-1 text-xs text-muted-foreground">Create, edit, publish, or archive learning products.</div>
              </div>
            </Link>
            <Link to="/admin/access" className="group flex items-start gap-3 rounded-xl bg-surface p-5 ring-1 ring-hairline hover:ring-brand/40">
              <KeyRound className="size-5 text-brand" />
              <div>
                <div className="text-sm font-semibold text-foreground group-hover:text-brand">Grant course access</div>
                <div className="mt-1 text-xs text-muted-foreground">Enroll any user in any course manually.</div>
              </div>
            </Link>
            <Link to="/admin/blogs" className="group flex items-start gap-3 rounded-xl bg-surface p-5 ring-1 ring-hairline hover:ring-brand/40">
              <FileText className="size-5 text-brand" />
              <div>
                <div className="text-sm font-semibold text-foreground group-hover:text-brand">Manage blog</div>
                <div className="mt-1 text-xs text-muted-foreground">Write, edit, and publish SEO articles.</div>
              </div>
            </Link>
            <Link to="/profile" className="group flex items-start gap-3 rounded-xl bg-surface p-5 ring-1 ring-hairline hover:ring-brand/40">
              <Users className="size-5 text-brand" />
              <div>
                <div className="text-sm font-semibold text-foreground group-hover:text-brand">Your profile</div>
                <div className="mt-1 text-xs text-muted-foreground">Avatar, bio, phone, and business contact details.</div>
              </div>
            </Link>
            <Link to="/admin/mentor" className="group flex items-start gap-3 rounded-xl bg-surface p-5 ring-1 ring-hairline hover:ring-brand/40">
              <UserCog className="size-5 text-brand" />
              <div>
                <div className="text-sm font-semibold text-foreground group-hover:text-brand">Edit mentor profile</div>
                <div className="mt-1 text-xs text-muted-foreground">Update the mentor photo, bio, and stats.</div>
              </div>
            </Link>
          </div>

          <div className="mt-12 rounded-xl bg-surface ring-1 ring-hairline">
            <div className="flex items-center justify-between border-b border-hairline p-6">
              <h2 className="text-base font-semibold text-foreground">Course analytics</h2>
              <Link to="/admin/access" className="text-xs font-medium text-brand hover:underline">Grant access →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  <tr className="border-b border-hairline">
                    <th className="p-4 text-left">Course</th>
                    <th className="p-4 text-right">Enrolled</th>
                    <th className="p-4 text-right">Avg progress</th>
                    <th className="p-4 text-right">Completed</th>
                    <th className="p-4 text-right">Certs issued</th>
                    <th className="p-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {courseAnalytics.map((c) => (
                    <tr key={c.id}>
                      <td className="p-4 font-medium text-foreground">{c.title}</td>
                      <td className="p-4 text-right text-foreground">{c.enrolled}</td>
                      <td className="p-4 text-right text-muted-foreground">{c.avg}%</td>
                      <td className="p-4 text-right text-muted-foreground">{c.completed}</td>
                      <td className="p-4 text-right text-muted-foreground">{c.issued}</td>
                      <td className="p-4 text-right font-medium text-foreground">${c.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  {courseAnalytics.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">No data yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 rounded-xl bg-surface ring-1 ring-hairline">
            <div className="flex items-center justify-between border-b border-hairline p-6">
              <h2 className="text-base font-semibold text-foreground">Recent catalog</h2>
              <Link to="/admin/courses" className="text-xs font-medium text-brand hover:underline">Manage all →</Link>
            </div>
            <div className="divide-y divide-hairline">
              {recentCourses.map((c) => (
                <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-4 text-sm">
                  <span className="truncate font-medium text-foreground">{c.title}</span>
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{c.level}</span>
                  <span className="text-xs text-muted-foreground">{c.lesson_count} lessons</span>
                  <span className="text-xs font-medium text-foreground">${(c.price_cents / 100).toFixed(0)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ring-1 ${
                      c.published
                        ? "bg-brand/10 text-brand ring-brand/30"
                        : "bg-surface-2 text-muted-foreground ring-hairline"
                    }`}
                  >
                    {c.published ? "Live" : "Draft"}
                  </span>
                </div>
              ))}
              {recentCourses.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No courses yet.</p> : null}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}