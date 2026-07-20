import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { BookOpen, GraduationCap, Award, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, progress, course:courses(id, slug, title, subtitle, lesson_count)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["certificates", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, issued_at, course:courses(title, cert_code)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const stats = [
    { icon: BookOpen, label: "Enrolled", value: enrollments.length },
    { icon: GraduationCap, label: "In progress", value: enrollments.filter((e) => (e.progress ?? 0) < 100).length },
    { icon: Award, label: "Certificates", value: certificates.length },
  ];

  return (
    <PageShell>
      <section className="border-b border-hairline py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6">
          <span className="text-[11px] font-medium tracking-widest text-brand uppercase">Dashboard</span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}.
            </h1>
            {isAdmin ? (
              <Link to="/admin" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
                Admin Console
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <div>
                <div className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">{s.label}</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">{s.value}</div>
              </div>
              <s.icon className="size-6 text-brand" />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-7xl px-6">
          <h2 className="text-xl font-semibold text-foreground">Continue learning</h2>
          <div className="mt-6 grid gap-4">
            {enrollments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline p-12 text-center">
                <p className="text-sm text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
                <Link to="/courses" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                  Browse the catalog <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              enrollments.map((e) => {
                const c = e.course as { id: string; slug: string; title: string; subtitle: string; lesson_count: number } | null;
                if (!c) return null;
                return (
                  <div key={e.id} className="flex flex-col gap-4 rounded-xl bg-surface p-6 ring-1 ring-hairline md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
                        <div className="h-full bg-brand" style={{ width: `${e.progress ?? 0}%` }} />
                      </div>
                      <div className="mt-2 text-[11px] font-medium text-muted-foreground">{e.progress ?? 0}% complete</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <h2 className="mt-16 text-xl font-semibold text-foreground">Certificates</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">Certificates you earn will appear here.</p>
            ) : (
              certificates.map((cert) => {
                const c = cert.course as { title: string; cert_code: string | null } | null;
                return (
                  <div key={cert.id} className="rounded-xl bg-gradient-to-br from-brand/10 to-surface p-6 ring-1 ring-brand/30">
                    <div className="text-[10px] font-bold tracking-widest text-brand uppercase">{c?.cert_code ?? "Certificate"}</div>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{c?.title}</h3>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Issued {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}