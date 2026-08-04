import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { useAuth } from "@/hooks/use-auth";
import {
  Award,
  BookOpen,
  ChevronDown,
  Clock,
  FlaskConical,
  Lock,
  PlayCircle,
  Target,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/courses_/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${name} — AI Security Hub` },
        { name: "description", content: `Curriculum, labs and projects for ${name}. Enroll and start learning on AI Security Hub.` },
        { property: "og:title", content: `${name} — AI Security Hub` },
        { property: "og:description", content: `Curriculum, labs and projects for ${name}.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () =>
      (
        await supabase
          .from("courses")
          .select("*, modules(id, title, description, order_index, lessons(id, title, duration_minutes, order_index, is_preview))")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle()
      ).data,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", course?.id, user?.id],
    enabled: !!course && !!user,
    queryFn: async () =>
      (
        await supabase
          .from("enrollments")
          .select("id, progress_percent")
          .eq("course_id", course!.id)
          .eq("user_id", user!.id)
          .maybeSingle()
      ).data,
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-6 py-32 text-sm text-muted-foreground">Loading course…</div>
      </PageShell>
    );
  }

  if (!course) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-6 py-32">
          <h1 className="text-2xl font-semibold text-foreground">Course not found</h1>
          <Link to="/courses" className="mt-4 inline-block text-sm font-medium text-brand">Back to catalog</Link>
        </div>
      </PageShell>
    );
  }

  const modules = [...(course.modules ?? [])].sort((a, b) => a.order_index - b.order_index);
  const lessonTotal = modules.reduce((n, m) => n + (m.lessons?.length ?? 0), 0) || course.lesson_count;
  const isMasterclass = course.kind === "masterclass";
  const status = (course.display_status ?? "live") as "live" | "coming_soon" | "in_development";
  const unavailable = status !== "live";
  const freeEnroll = course.free_enroll || course.price_cents === 0;

  async function enroll() {
    if (!user) {
      navigate({ to: "/auth", search: { mode: "login", redirect: `/courses/${slug}` } });
      return;
    }
    if (!course) return;
    setBusy(true);
    await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });
    setBusy(false);
    qc.invalidateQueries({ queryKey: ["enrollment", course.id, user.id] });
    navigate({ to: "/learn/$slug", params: { slug: course.slug } });
  }

  return (
    <PageShell>
      <section className="border-b border-hairline py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{isMasterclass ? "Free Masterclass" : course.is_certification ? "Certification" : "Course"}</Badge>
              {status === "coming_soon" ? <Badge>Coming soon</Badge> : null}
              {status === "in_development" ? <Badge>In development</Badge> : null}
              <Badge>{course.level}</Badge>
              <Badge>{Math.max(1, Math.round((course.duration_minutes || lessonTotal * 45) / 60))} hours</Badge>
              <Badge>{lessonTotal} lessons</Badge>
            </div>
            <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-[62ch] text-pretty text-base leading-relaxed text-muted-foreground">
              {course.subtitle}
            </p>
            {course.description ? (
              <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">{course.description}</p>
            ) : null}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={Clock} label="Duration" value={`${Math.max(1, Math.round((course.duration_minutes || lessonTotal * 45) / 60))}h`} />
              <Metric icon={BookOpen} label="Lessons" value={String(lessonTotal)} />
              <Metric icon={FlaskConical} label="Labs" value={String(Math.max(2, Math.floor(lessonTotal / 3)))} />
              <Metric icon={Target} label="Projects" value={String(Math.max(1, Math.floor(lessonTotal / 4)))} />
            </div>
          </div>

          <aside className="h-fit rounded-2xl bg-surface p-6 ring-1 ring-hairline">
            <div className="aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-brand/25 via-surface to-background ring-1 ring-hairline">
              {course.cover_url ? (
                <img src={course.cover_url} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid h-full place-items-center">
                  <PlayCircle className="size-12 text-brand" />
                </div>
              )}
            </div>
            <div className="mt-5 text-3xl font-semibold text-foreground">
              {freeEnroll ? "Free" : `$${(course.price_cents / 100).toFixed(0)}`}
            </div>
            {unavailable && !enrollment ? (
              <>
                <button
                  disabled
                  className="mt-5 w-full cursor-not-allowed rounded-md bg-surface-2 px-5 py-3 text-sm font-semibold text-muted-foreground ring-1 ring-hairline"
                >
                  {status === "coming_soon" ? "Coming soon" : "In development"}
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Enrollment opens once this track goes live.
                </p>
              </>
            ) : enrollment ? (
              <Link
                to="/learn/$slug"
                params={{ slug: course.slug }}
                className="mt-5 block rounded-md bg-brand px-5 py-3 text-center text-sm font-semibold text-brand-foreground ring-1 ring-brand"
              >
                Continue learning · {enrollment.progress_percent}%
              </Link>
            ) : isMasterclass && !user ? (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "login", redirect: "/register-masterclass" }}
                  className="mt-5 block rounded-md bg-brand px-5 py-3 text-center text-sm font-semibold text-brand-foreground ring-1 ring-brand"
                >
                  Log in or sign up to reserve
                </Link>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Free account required — you'll come straight back to the registration form.
                </p>
              </>
            ) : isMasterclass ? (
              <Link
                to="/register-masterclass"
                className="mt-5 block rounded-md bg-brand px-5 py-3 text-center text-sm font-semibold text-brand-foreground ring-1 ring-brand"
              >
                Reserve Free Seat
              </Link>
            ) : (
              <button
                onClick={enroll}
                disabled={busy}
                className="mt-5 w-full rounded-md bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground ring-1 ring-brand disabled:opacity-60"
              >
                {busy ? "Enrolling…" : freeEnroll ? "Enroll free" : "Enroll now"}
              </button>
            )}
            <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Award className="size-3.5 text-brand" /> Certificate of completion</li>
              <li className="flex items-center gap-2"><Users className="size-3.5 text-brand" /> Community access</li>
              <li className="flex items-center gap-2"><FlaskConical className="size-3.5 text-brand" /> Hands-on practice labs</li>
              <li className="flex items-center gap-2"><Clock className="size-3.5 text-brand" /> Lifetime recorded access</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-semibold text-foreground">Curriculum</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {modules.length} modules · {lessonTotal} lessons
          </p>
          <div className="mt-6 divide-y divide-hairline overflow-hidden rounded-xl bg-surface ring-1 ring-hairline">
            {modules.length === 0 ? (
              <p className="p-8 text-sm text-muted-foreground">Curriculum is being finalised for this track.</p>
            ) : (
              modules.map((m, mi) => {
                const lessons = [...(m.lessons ?? [])].sort((a, b) => a.order_index - b.order_index);
                const isOpen = open === m.id || (open === null && mi === 0);
                return (
                  <div key={m.id}>
                    <button
                      onClick={() => setOpen(isOpen ? "" : m.id)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-surface-2"
                    >
                      <div>
                        <div className="text-[10px] font-bold tracking-widest text-brand uppercase">Module {mi + 1}</div>
                        <div className="mt-1 text-sm font-semibold text-foreground">{m.title}</div>
                        {m.description ? <div className="mt-1 text-xs text-muted-foreground">{m.description}</div> : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">{lessons.length} lessons</span>
                        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {isOpen ? (
                      <ul className="border-t border-hairline bg-background/40">
                        {lessons.map((l) => (
                          <li key={l.id} className="flex items-center justify-between gap-4 px-5 py-3">
                            <div className="flex items-center gap-3">
                              {l.is_preview || enrollment ? (
                                <PlayCircle className="size-4 text-brand" />
                              ) : (
                                <Lock className="size-4 text-muted-foreground" />
                              )}
                              <span className="text-sm text-foreground">{l.title}</span>
                              {l.is_preview ? (
                                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand">Preview</span>
                              ) : null}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{l.duration_minutes} min</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold tracking-widest text-brand uppercase ring-1 ring-brand/20">
      {children}
    </span>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-3 ring-1 ring-hairline">
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        <Icon className="size-3 text-brand" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}