import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { levelProgress } from "@/lib/gamification";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  Flame,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);

  const { data: enrollments = [] } = useQuery({
    queryKey: ["dashboard", "enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, progress_percent, completed_at, last_lesson_id, course:courses(id, slug, title, subtitle, lesson_count, kind, category_id)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["dashboard", "certificates", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, issued_at, cert_number, course:courses(title, cert_code)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: xp } = useQuery({
    queryKey: ["dashboard", "xp", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("user_xp").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });

  const { data: streak } = useQuery({
    queryKey: ["dashboard", "streak", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["dashboard", "achievements"],
    queryFn: async () => (await supabase.from("achievements").select("*").order("sort_order")).data ?? [],
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["dashboard", "badges", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("user_badges").select("achievement_id, earned_at").eq("user_id", user!.id)).data ?? [],
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["dashboard", "activity", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("lesson_progress").select("completed_at, lesson_id").eq("user_id", user!.id)).data ?? [],
  });

  const { data: catalog = [] } = useQuery({
    queryKey: ["dashboard", "catalog"],
    queryFn: async () =>
      (await supabase
        .from("courses")
        .select("id, slug, title, subtitle, level, kind, category_id, price_cents, lesson_count")
        .eq("published", true)).data ?? [],
  });

  const { data: nextLessons = [] } = useQuery({
    queryKey: ["dashboard", "next-lessons", user?.id, enrollments.length],
    enabled: !!user && enrollments.length > 0,
    queryFn: async () => {
      const ids = enrollments.map((e) => (e.course as { id: string } | null)?.id).filter(Boolean) as string[];
      if (ids.length === 0) return [];
      const { data: mods } = await supabase.from("modules").select("id, course_id, order_index").in("course_id", ids);
      const modIds = (mods ?? []).map((m) => m.id);
      if (modIds.length === 0) return [];
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, module_id, order_index, duration_minutes")
        .in("module_id", modIds);
      const { data: prog } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user!.id);
      const doneIds = new Set((prog ?? []).map((p) => p.lesson_id));
      const modMap = new Map((mods ?? []).map((m) => [m.id, m]));
      return (lessons ?? [])
        .filter((l) => !doneIds.has(l.id))
        .sort((a, b) => {
          const ma = modMap.get(a.module_id)?.order_index ?? 0;
          const mb = modMap.get(b.module_id)?.order_index ?? 0;
          return ma - mb || a.order_index - b.order_index;
        })
        .slice(0, 4)
        .map((l) => ({
          ...l,
          courseSlug:
            enrollments.find((e) => (e.course as { id: string } | null)?.id === modMap.get(l.module_id)?.course_id)
              ?.course as { slug: string } | undefined,
        }));
    },
  });

  const earned = useMemo(() => new Set(badges.map((b) => b.achievement_id)), [badges]);

  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => startOfDay(new Date(Date.now() - (6 - i) * 86400000)));
    return days.map((d) => {
      const next = new Date(d.getTime() + 86400000);
      const count = activity.filter((a) => {
        const t = new Date(a.completed_at);
        return t >= d && t < next;
      }).length;
      return { label: d.toLocaleDateString(undefined, { weekday: "short" }), count };
    });
  }, [activity]);

  const active = enrollments.filter((e) => (e.progress_percent ?? 0) < 100);
  const completed = enrollments.filter((e) => (e.progress_percent ?? 0) >= 100);
  const overall = enrollments.length
    ? Math.round(enrollments.reduce((n, e) => n + (e.progress_percent ?? 0), 0) / enrollments.length)
    : 0;

  const points = xp?.points ?? 0;
  const lp = levelProgress(points);

  const enrolledIds = new Set(enrollments.map((e) => (e.course as { id: string } | null)?.id));
  const interestedCats = new Set(
    enrollments.map((e) => (e.course as { category_id: string | null } | null)?.category_id).filter(Boolean),
  );
  const recommended = catalog
    .filter((c) => !enrolledIds.has(c.id))
    .sort((a, b) => {
      const sa = (interestedCats.has(a.category_id ?? "") ? 2 : 0) + (a.price_cents === 0 ? 1 : 0);
      const sb = (interestedCats.has(b.category_id ?? "") ? 2 : 0) + (b.price_cents === 0 ? 1 : 0);
      return sb - sa;
    })
    .slice(0, 3);

  const tips: string[] = [];
  if (enrollments.length === 0) tips.push("Start with the free Cybersecurity Career Masterclass to map your path before buying anything.");
  if ((streak?.current_streak ?? 0) === 0) tips.push("Complete one lesson today to start a learning streak — consistency beats intensity.");
  if (active.length > 2) tips.push(`You have ${active.length} courses in progress. Finish "${(active[0]?.course as { title: string } | null)?.title}" first to earn a certificate.`);
  if (completed.length > 0 && certificates.length === 0) tips.push("You finished a course — claim your certificate from the course page.");
  if (interestedCats.size > 0 && recommended[0]) tips.push(`Based on your enrollments, "${recommended[0].title}" is the natural next step.`);
  if (tips.length === 0) tips.push("You're on track. Aim for 3 lessons this week to keep your streak alive.");

  const stats = [
    { icon: BookOpen, label: "Enrolled", value: enrollments.length },
    { icon: GraduationCap, label: "In progress", value: active.length },
    { icon: Award, label: "Certificates", value: certificates.length },
    { icon: Zap, label: "XP points", value: points },
    { icon: Flame, label: "Day streak", value: streak?.current_streak ?? 0 },
    { icon: Trophy, label: "Badges", value: badges.length },
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
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[20rem_1fr]">
          <div className="flex flex-col items-center rounded-xl bg-surface p-8 ring-1 ring-hairline">
            <ProgressCircle percent={overall} />
            <div className="mt-5 text-center">
              <div className="text-sm font-semibold text-foreground">Overall progress</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {completed.length} completed · {active.length} in progress
              </div>
            </div>
            <div className="mt-6 w-full rounded-lg bg-background p-4 ring-1 ring-hairline">
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span>Level {xp?.level ?? 1}</span>
                <span>{lp.into}/{lp.needed} XP</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-brand" style={{ width: `${lp.percent}%` }} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        </div>

        <div className="mx-auto mt-12 max-w-7xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <h2 className="text-sm font-semibold text-foreground">Weekly activity</h2>
              <div className="mt-6 flex h-36 items-end gap-3">
                {weekly.map((d) => {
                  const max = Math.max(1, ...weekly.map((w) => w.count));
                  return (
                    <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t bg-brand/80"
                          style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 8 : 2 }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {activity.length} lessons completed all-time · longest streak {streak?.longest_streak ?? 0} days
              </p>
            </div>

            <div className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-brand" /> Recommended for you
              </h2>
              <ul className="mt-4 space-y-3">
                {tips.slice(0, 3).map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-brand" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2">
                {recommended.map((c) => (
                  <Link
                    key={c.id}
                    to="/courses/$slug"
                    params={{ slug: c.slug }}
                    className="flex items-center justify-between gap-3 rounded-lg bg-background p-3 text-xs ring-1 ring-hairline hover:ring-brand/40"
                  >
                    <span className="font-medium text-foreground">{c.title}</span>
                    <span className="shrink-0 text-brand">{c.price_cents === 0 ? "Free" : `$${(c.price_cents / 100).toFixed(0)}`}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <h2 className="mt-16 text-xl font-semibold text-foreground">Continue learning</h2>
          <div className="mt-6 grid gap-4">
            {active.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline p-12 text-center">
                <p className="text-sm text-muted-foreground">Nothing in progress right now.</p>
                <Link to="/courses" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                  Browse the catalog <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              active.map((e) => {
                const c = e.course as { id: string; slug: string; title: string; subtitle: string; lesson_count: number } | null;
                const pct = e.progress_percent ?? 0;
                if (!c) return null;
                return (
                  <div key={e.id} className="flex flex-col gap-4 rounded-xl bg-surface p-6 ring-1 ring-hairline md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
                        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 text-[11px] font-medium text-muted-foreground">{pct}% complete</div>
                    </div>
                    <Link
                      to="/learn/$slug"
                      params={{ slug: c.slug }}
                      className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand"
                    >
                      Resume
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {completed.length > 0 ? (
            <>
              <h2 className="mt-16 text-xl font-semibold text-foreground">Completed courses</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completed.map((e) => {
                  const c = e.course as { slug: string; title: string } | null;
                  if (!c) return null;
                  return (
                    <Link key={e.id} to="/courses/$slug" params={{ slug: c.slug }} className="rounded-xl bg-surface p-5 ring-1 ring-hairline hover:ring-brand/40">
                      <CheckCircle2 className="size-5 text-brand" />
                      <h3 className="mt-3 text-sm font-semibold text-foreground">{c.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">100% complete</p>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="size-4 text-brand" /> Upcoming lessons
              </h2>
              {nextLessons.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">Enroll in a course to see your next lessons here.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {nextLessons.map((l) => (
                    <li key={l.id}>
                      {l.courseSlug ? (
                        <Link
                          to="/learn/$slug"
                          params={{ slug: l.courseSlug.slug }}
                          search={{ lesson: l.id }}
                          className="flex items-center justify-between gap-3 rounded-lg bg-background p-3 text-xs ring-1 ring-hairline hover:ring-brand/40"
                        >
                          <span className="text-foreground">{l.title}</span>
                          <span className="shrink-0 text-muted-foreground">{l.duration_minutes} min</span>
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Trophy className="size-4 text-brand" /> Achievements
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {achievements.map((a) => {
                  const has = earned.has(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`rounded-lg p-3 ring-1 ${has ? "bg-brand/10 ring-brand/30" : "bg-background ring-hairline opacity-60"}`}
                    >
                      <div className="text-xs font-semibold text-foreground">{a.title}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{a.description}</div>
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-brand">
                        {has ? "Earned" : `+${a.xp_reward} XP`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-brand">
                      <Download className="size-3" /> {cert.cert_number}
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

function ProgressCircle({ percent }: { percent: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative size-36">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--hairline)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * percent) / 100}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-2xl font-semibold text-foreground">{percent}%</span>
      </div>
    </div>
  );
}