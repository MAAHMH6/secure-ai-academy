import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, AdminCard } from "@/components/admin/AdminPage";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2, Edit3, Save, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/curriculum/$id")({
  component: CurriculumBuilder,
});

type LessonForm = {
  title: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  is_preview: boolean;
};

const emptyLesson: LessonForm = { title: "", content: "", video_url: "", duration_minutes: 10, is_preview: false };

function CurriculumBuilder() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonFor, setLessonFor] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLesson);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);

  const { data: course } = useQuery({
    queryKey: ["builder-course", id],
    queryFn: async () => (await supabase.from("courses").select("*").eq("id", id).maybeSingle()).data,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["builder-modules", id],
    queryFn: async () =>
      (await supabase.from("modules").select("*").eq("course_id", id).order("order_index")).data ?? [],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["builder-lessons", id, modules.map((m) => m.id).join(",")],
    enabled: modules.length > 0,
    queryFn: async () =>
      (
        await supabase
          .from("lessons")
          .select("*")
          .in("module_id", modules.map((m) => m.id))
          .order("order_index")
      ).data ?? [],
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["builder-modules", id] });
    qc.invalidateQueries({ queryKey: ["builder-lessons"] });
  }

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    const { error } = await supabase.from("modules").insert({ course_id: id, title: moduleTitle.trim(), order_index: modules.length });
    if (error) return toast.error(error.message);
    toast.success("Module added");
    setModuleTitle("");
    refresh();
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module and all of its lessons?")) return;
    await supabase.from("lessons").delete().eq("module_id", moduleId);
    const { error } = await supabase.from("modules").delete().eq("id", moduleId);
    if (error) return toast.error(error.message);
    toast.success("Module deleted");
    refresh();
  }

  async function moveModule(index: number, dir: -1 | 1) {
    const a = modules[index];
    const b = modules[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("modules").update({ order_index: b.order_index }).eq("id", a.id),
      supabase.from("modules").update({ order_index: a.order_index }).eq("id", b.id),
    ]);
    refresh();
  }

  async function moveLesson(list: typeof lessons, index: number, dir: -1 | 1) {
    const a = list[index];
    const b = list[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("lessons").update({ order_index: b.order_index }).eq("id", a.id),
      supabase.from("lessons").update({ order_index: a.order_index }).eq("id", b.id),
    ]);
    refresh();
  }

  async function saveLesson(e: React.FormEvent, moduleId: string, count: number) {
    e.preventDefault();
    const { error } = editingLesson
      ? await supabase.from("lessons").update(lessonForm).eq("id", editingLesson)
      : await supabase.from("lessons").insert({ ...lessonForm, module_id: moduleId, order_index: count });
    if (error) return toast.error(error.message);
    toast.success(editingLesson ? "Lesson updated" : "Lesson added");
    setLessonForm(emptyLesson);
    setEditingLesson(null);
    setLessonFor(null);
    refresh();
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) return toast.error(error.message);
    toast.success("Lesson deleted");
    refresh();
  }

  const totalLessons = lessons.length;
  const totalMinutes = lessons.reduce((a, l) => a + (l.duration_minutes ?? 0), 0);

  async function syncCounts() {
    const { error } = await supabase.from("courses").update({ lesson_count: totalLessons, duration_minutes: totalMinutes }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Course totals synced");
    qc.invalidateQueries({ queryKey: ["builder-course", id] });
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  return (
    <>
      <PageHeader
        eyebrow={`Learning · ${course?.kind ?? "course"}`}
        title={course?.title ?? "Curriculum builder"}
        description="Add modules and lessons, reorder them, and attach videos or notes. Works for courses, certifications, and masterclasses."
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/courses" search={{ kind: (course?.kind ?? "course") as "course" }} className="text-sm text-brand hover:underline">
          ← Back to catalog
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{modules.length} modules · {totalLessons} lessons · {totalMinutes} min</span>
          <button onClick={syncCounts} className="inline-flex items-center gap-1.5 rounded-md bg-surface px-3 py-1.5 ring-1 ring-hairline hover:text-foreground">
            <Save className="size-3.5" /> Sync totals to course
          </button>
        </div>
      </div>

      <form onSubmit={addModule} className="mt-6 flex gap-3">
        <input
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          placeholder="New module title"
          className="flex-1 rounded-md bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
        />
        <button className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
          <Plus className="size-4" /> Add module
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {modules.map((m, mi) => {
          const own = lessons.filter((l) => l.module_id === m.id);
          return (
            <AdminCard key={m.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Module {mi + 1}</div>
                  <h3 className="mt-1 text-sm font-semibold text-foreground">{m.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => moveModule(mi, -1)} className="rounded-md p-1.5 text-muted-foreground hover:text-brand"><ArrowUp className="size-4" /></button>
                  <button onClick={() => moveModule(mi, 1)} className="rounded-md p-1.5 text-muted-foreground hover:text-brand"><ArrowDown className="size-4" /></button>
                  <button onClick={() => deleteModule(m.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
                {own.map((l, li) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="truncate text-foreground">{li + 1}. {l.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {l.duration_minutes} min{l.is_preview ? " · free preview" : ""}{l.video_url ? " · video" : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => moveLesson(own, li, -1)} className="rounded-md p-1.5 text-muted-foreground hover:text-brand"><ArrowUp className="size-3.5" /></button>
                      <button onClick={() => moveLesson(own, li, 1)} className="rounded-md p-1.5 text-muted-foreground hover:text-brand"><ArrowDown className="size-3.5" /></button>
                      <button
                        onClick={() => {
                          setLessonFor(m.id);
                          setEditingLesson(l.id);
                          setLessonForm({
                            title: l.title,
                            content: l.content ?? "",
                            video_url: l.video_url ?? "",
                            duration_minutes: l.duration_minutes,
                            is_preview: l.is_preview,
                          });
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-brand"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button onClick={() => deleteLesson(l.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </li>
                ))}
                {own.length === 0 ? <li className="py-3 text-xs text-muted-foreground">No lessons yet.</li> : null}
              </ul>

              {lessonFor === m.id ? (
                <form onSubmit={(e) => saveLesson(e, m.id, own.length)} className="mt-4 grid gap-3 rounded-lg bg-background p-4 ring-1 ring-hairline md:grid-cols-2">
                  <Field label="Lesson title" value={lessonForm.title} onChange={(v) => setLessonForm({ ...lessonForm, title: v })} required />
                  <Field label="Video URL" value={lessonForm.video_url} onChange={(v) => setLessonForm({ ...lessonForm, video_url: v })} />
                  <Field label="Duration (min)" type="number" value={String(lessonForm.duration_minutes)} onChange={(v) => setLessonForm({ ...lessonForm, duration_minutes: Number(v) })} />
                  <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
                    <input type="checkbox" checked={lessonForm.is_preview} onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })} /> Free preview
                  </label>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Lesson notes</label>
                    <textarea
                      rows={4}
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
                    />
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <button className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">{editingLesson ? "Update lesson" : "Add lesson"}</button>
                    <button
                      type="button"
                      onClick={() => { setLessonFor(null); setEditingLesson(null); setLessonForm(emptyLesson); }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-surface px-4 py-2 text-sm ring-1 ring-hairline"
                    >
                      <X className="size-3.5" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => { setLessonFor(m.id); setEditingLesson(null); setLessonForm(emptyLesson); }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
                >
                  <Plus className="size-3.5" /> Add lesson
                </button>
              )}
            </AdminCard>
          );
        })}
        {modules.length === 0 ? <p className="rounded-xl bg-surface p-8 text-center text-sm text-muted-foreground ring-1 ring-hairline">No modules yet — add the first one above.</p> : null}
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        type={type}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
      />
    </div>
  );
}