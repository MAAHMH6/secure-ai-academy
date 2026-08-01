import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { onLessonCompleted } from "@/lib/gamification";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Download, Lock, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learn/$slug")({
  validateSearch: (s) => z.object({ lesson: z.string().optional() }).parse(s),
  component: LessonPlayer;
});

type FlatLesson = {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  is_preview: boolean;
  moduleTitle: string;
};

function LessonPlayer() {
  const { slug } = Route.useParams();
  const { lesson: lessonParam } = Route.useSearch();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data: course } = useQuery({
    queryKey: ["learn-course", slug],
    queryFn: async () =>
      (
        await supabase
          .from("courses")
          .select("id, slug, title, kind, modules(id, title, order_index, lessons(id, title, content, video_url, duration_minutes, order_index, is_preview))")
          .eq("slug", slug)
          .maybeSingle()
      ).data,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["lesson-progress", user?.id, slug],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user!.id)).data ?? [],
  });

  const flat = useMemo<FlatLesson[]>(() => {
    if (!course) return [];
    return [...(course.modules ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .flatMap((m) =>
        [...(m.lessons ?? [])]
          .sort((a, b) => a.order_index - b.order_index)
          .map((l) => ({ ...l, moduleTitle: m.title })),
      );
  }, [course]);

  const done = useMemo(() => new Set(progress.map((p) => p.lesson_id)), [progress]);
  const currentIndex = Math.max(0, flat.findIndex((l) => l.id === lessonParam));
  const current = flat[currentIndex];

  const { data: resources = [] } = useQuery({
    queryKey: ["lesson-resources", current?.id],
    enabled: !!current,
    queryFn: async () =>
      (await supabase.from("lesson_resources").select("*").eq("lesson_id", current!.id).order("order_index")).data ?? [],
  });

  function unlocked(i: number) {
    if (i === 0) return true;
    const prev = flat[i - 1];
    return !!prev && done.has(prev.id);
  }

  async function markComplete() {
    if (!user || !current || !course) return;
    setBusy(true);
    if (!done.has(current.id)) {
      await supabase.from("lesson_progress").insert({ user_id: user.id, lesson_id: current.id });
      const completedInCourse = flat.filter((l) => done.has(l.id) || l.id === current.id).length;
      const finished = completedInCourse >= flat.length;
      const pct = flat.length ? Math.round((completedInCourse / flat.length) * 100) : 0;
      await supabase
        .from("enrollments")
        .update({
          progress_percent: pct,
          last_lesson_id: current.id,
          completed_at: finished ? new Date().toISOString() : null,
        })
        .eq("user_id", user.id)
        .eq("course_id", course.id);

      const { count } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      await onLessonCompleted(user.id, count ?? completedInCourse, finished, course.kind === "masterclass");
      qc.invalidateQueries({ queryKey: ["lesson-progress", user.id, slug] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    }
    setBusy(false);
  }

  if (!course || !current) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-6 py-32 text-sm text-muted-foreground">Loading lessons…</div>
      </PageShell>
    );
  }

  const prev = flat[currentIndex - 1];
  const next = flat[currentIndex + 1];
  const completedCount = flat.filter((l) => done.has(l.id)).length;

  return (
    <PageShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_20rem]">
        <div>
          <Link to="/courses/$slug" params={{ slug: course.slug }} className="text-xs font-medium text-brand">
            ← {course.title}
          </Link>
          <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-background ring-1 ring-hairline">
            {current.video_url ? (
              <iframe
                src={current.video_url}
                title={current.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <PlayCircle className="size-12" />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-brand uppercase">{current.moduleTitle}</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{current.title}</h1>
            </div>
            <button
              onClick={markComplete}
              disabled={busy || done.has(current.id)}
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground ring-1 ring-brand disabled:opacity-60"
            >
              {done.has(current.id) ? "Completed" : busy ? "Saving…" : "Mark complete"}
            </button>
          </div>

          {current.content ? (
            <div className="mt-6 rounded-xl bg-surface p-6 text-sm leading-relaxed text-muted-foreground ring-1 ring-hairline">
              <h2 className="mb-2 text-sm font-semibold text-foreground">Lesson notes</h2>
              {current.content}
            </div>
          ) : null}

          <div className="mt-6 rounded-xl bg-surface p-6 ring-1 ring-hairline">
            <h2 className="text-sm font-semibold text-foreground">Resources</h2>
            {resources.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No downloads attached to this lesson yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {resources.map((r) => (
                  <li key={r.id}>
                    <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-brand hover:underline">
                      <Download className="size-3.5" /> {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            {prev ? (
              <Link
                to="/learn/$slug"
                params={{ slug: course.slug }}
                search={{ lesson: prev.id }}
                className="inline-flex items-center gap-1 rounded-md bg-surface px-4 py-2 text-sm font-medium text-foreground ring-1 ring-hairline"
              >
                <ChevronLeft className="size-4" /> Previous
              </Link>
            ) : <span />}
            {next ? (
              done.has(current.id) ? (
                <Link
                  to="/learn/$slug"
                  params={{ slug: course.slug }}
                  search={{ lesson: next.id }}
                  className="inline-flex items-center gap-1 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground ring-1 ring-brand"
                >
                  Next lesson <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-surface px-4 py-2 text-sm text-muted-foreground ring-1 ring-hairline">
                  <Lock className="size-3.5" /> Complete to unlock next
                </span>
              )
            ) : null}
          </div>
        </div>

        <aside className="h-fit rounded-xl bg-surface p-5 ring-1 ring-hairline">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Course content</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full bg-brand" style={{ width: `${flat.length ? (completedCount / flat.length) * 100 : 0}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">{completedCount} of {flat.length} lessons complete</div>
          <ul className="mt-4 space-y-1">
            {flat.map((l, i) => {
              const isDone = done.has(l.id);
              const open = unlocked(i) || isDone;
              const active = l.id === current.id;
              return (
                <li key={l.id}>
                  {open ? (
                    <Link
                      to="/learn/$slug"
                      params={{ slug: course.slug }}
                      search={{ lesson: l.id }}
                      className={`flex items-start gap-2 rounded-md px-2 py-2 text-xs transition-colors ${active ? "bg-brand/10 text-foreground ring-1 ring-brand/30" : "text-muted-foreground hover:bg-surface-2"}`}
                    >
                      {isDone ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand" /> : <Circle className="mt-0.5 size-3.5 shrink-0" />}
                      <span>{l.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground/60">
                      <Lock className="mt-0.5 size-3.5 shrink-0" />
                      <span>{l.title}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </PageShell>
  );
}