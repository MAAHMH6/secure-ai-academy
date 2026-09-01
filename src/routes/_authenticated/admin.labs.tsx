import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, AdminCard } from "@/components/admin/AdminPage";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Edit3, ExternalLink, FlaskConical, Plus, Save, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/labs")({
  component: LabsAdmin,
});

type Difficulty = "beginner" | "intermediate" | "advanced";

type LabForm = {
  title: string;
  slug: string;
  summary: string;
  objectives: string;
  tools: string;
  instructions: string;
  difficulty: Difficulty;
  estimated_minutes: number;
  lab_url: string;
  lesson_id: string;
  published: boolean;
};

const emptyLab: LabForm = {
  title: "",
  slug: "",
  summary: "",
  objectives: "",
  tools: "",
  instructions: "",
  difficulty: "beginner",
  estimated_minutes: 30,
  lab_url: "",
  lesson_id: "",
  published: true,
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function LabsAdmin() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState<string>("");
  const [form, setForm] = useState<LabForm>(emptyLab);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-lab-courses"],
    queryFn: async () =>
      (await supabase.from("courses").select("id, title, kind, labs_count").order("title")).data ?? [],
  });

  const activeCourse = courseId || courses[0]?.id || "";

  const { data: labs = [] } = useQuery({
    queryKey: ["admin-labs", activeCourse],
    enabled: !!activeCourse,
    queryFn: async () =>
      (await supabase.from("labs").select("*").eq("course_id", activeCourse).order("order_index")).data ?? [],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["admin-lab-lessons", activeCourse],
    enabled: !!activeCourse,
    queryFn: async () => {
      const { data: mods } = await supabase.from("modules").select("id, title, order_index").eq("course_id", activeCourse).order("order_index");
      if (!mods?.length) return [] as { id: string; title: string; module: string }[];
      const { data: ls } = await supabase
        .from("lessons")
        .select("id, title, module_id, order_index")
        .in("module_id", mods.map((m) => m.id))
        .order("order_index");
      return (ls ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        module: mods.find((m) => m.id === l.module_id)?.title ?? "",
      }));
    },
  });

  const lessonName = useMemo(
    () => Object.fromEntries(lessons.map((l) => [l.id, `${l.module} · ${l.title}`])),
    [lessons],
  );

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin-labs", activeCourse] });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCourse) return toast.error("Pick a course first");
    const payload = {
      course_id: activeCourse,
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      summary: form.summary || null,
      objectives: form.objectives || null,
      tools: form.tools || null,
      instructions: form.instructions || null,
      difficulty: form.difficulty,
      estimated_minutes: Number(form.estimated_minutes) || 30,
      lab_url: form.lab_url || null,
      lesson_id: form.lesson_id || null,
      published: form.published,
    };
    const { error } = editing
      ? await supabase.from("labs").update(payload).eq("id", editing)
      : await supabase.from("labs").insert({ ...payload, order_index: labs.length });
    if (error) return toast.error(error.message);
    toast.success(editing ? "Lab updated" : "Lab created");
    setForm(emptyLab);
    setEditing(null);
    setShowForm(false);
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this lab?")) return;
    const { error } = await supabase.from("labs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lab deleted");
    refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = labs[index];
    const b = labs[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("labs").update({ order_index: b.order_index }).eq("id", a.id),
      supabase.from("labs").update({ order_index: a.order_index }).eq("id", b.id),
    ]);
    refresh();
  }

  async function togglePublish(id: string, published: boolean) {
    const { error } = await supabase.from("labs").update({ published: !published }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  }

  async function syncCount() {
    const { error } = await supabase.from("courses").update({ labs_count: labs.length }).eq("id", activeCourse);
    if (error) return toast.error(error.message);
    toast.success("Labs count synced to course");
    qc.invalidateQueries({ queryKey: ["admin-lab-courses"] });
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  const course = courses.find((c) => c.id === activeCourse);

  return (
    <>
      <PageHeader
        eyebrow="Learning"
        title="Labs"
        description="Build hands-on labs, attach them to a course and to a specific lesson. Published labs appear on the course page."
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Course / certification</label>
          <select
            value={activeCourse}
            onChange={(e) => {
              setCourseId(e.target.value);
              setShowForm(false);
              setEditing(null);
            }}
            className="mt-1 block min-w-72 rounded-md bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.kind})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {labs.length} labs · course field shows {course?.labs_count ?? 0}
          </span>
          <button onClick={syncCount} className="inline-flex items-center gap-1.5 rounded-md bg-surface px-3 py-1.5 ring-1 ring-hairline hover:text-foreground">
            <Save className="size-3.5" /> Sync labs count
          </button>
          <button
            onClick={() => {
              setForm(emptyLab);
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground ring-1 ring-brand"
          >
            <Plus className="size-4" /> New lab
          </button>
        </div>
      </div>

      {showForm ? (
        <AdminCard className="mt-6 p-5">
          <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
            <Field label="Lab title" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: editing ? form.slug : slugify(v) })} required />
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <div>
              <label className="text-xs font-medium text-muted-foreground">Attach to lesson (optional)</label>
              <select
                value={form.lesson_id}
                onChange={(e) => setForm({ ...form, lesson_id: e.target.value })}
                className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
              >
                <option value="">Not attached</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.module} · {l.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
                className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Field label="Estimated minutes" type="number" value={String(form.estimated_minutes)} onChange={(v) => setForm({ ...form, estimated_minutes: Number(v) })} />
            <Field label="Lab environment URL (optional)" value={form.lab_url} onChange={(v) => setForm({ ...form, lab_url: v })} />
            <Area label="Summary" rows={2} value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} />
            <Area label="Objectives (one per line)" rows={2} value={form.objectives} onChange={(v) => setForm({ ...form, objectives: v })} />
            <Area label="Tools (comma separated)" rows={2} value={form.tools} onChange={(v) => setForm({ ...form, tools: v })} />
            <Area label="Step-by-step instructions" rows={6} value={form.instructions} onChange={(v) => setForm({ ...form, instructions: v })} full />
            <label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
                {editing ? "Update lab" : "Create lab"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm(emptyLab);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-surface px-4 py-2 text-sm ring-1 ring-hairline"
              >
                <X className="size-3.5" /> Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      ) : null}

      <div className="mt-6 space-y-3">
        {labs.map((lab, i) => (
          <AdminCard key={lab.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <FlaskConical className="size-4 text-brand" />
                <span className="text-sm font-semibold text-foreground">
                  {i + 1}. {lab.title}
                </span>
                {!lab.published ? (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-bold tracking-widest text-muted-foreground uppercase ring-1 ring-hairline">
                    Draft
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {lab.difficulty} · {lab.estimated_minutes} min
                {lab.lesson_id ? ` · lesson: ${lessonName[lab.lesson_id] ?? "linked"}` : " · not attached to a lesson"}
              </div>
              {lab.summary ? <p className="mt-2 max-w-[70ch] text-xs text-muted-foreground">{lab.summary}</p> : null}
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => move(i, -1)} className="rounded-md p-1.5 text-muted-foreground hover:text-brand"><ArrowUp className="size-4" /></button>
              <button onClick={() => move(i, 1)} className="rounded-md p-1.5 text-muted-foreground hover:text-brand"><ArrowDown className="size-4" /></button>
              <button
                onClick={() => togglePublish(lab.id, lab.published)}
                className="rounded-md px-2 py-1 text-[11px] text-muted-foreground ring-1 ring-hairline hover:text-foreground"
              >
                {lab.published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => {
                  setEditing(lab.id);
                  setShowForm(true);
                  setForm({
                    title: lab.title,
                    slug: lab.slug,
                    summary: lab.summary ?? "",
                    objectives: lab.objectives ?? "",
                    tools: lab.tools ?? "",
                    instructions: lab.instructions ?? "",
                    difficulty: lab.difficulty as Difficulty,
                    estimated_minutes: lab.estimated_minutes,
                    lab_url: lab.lab_url ?? "",
                    lesson_id: lab.lesson_id ?? "",
                    published: lab.published,
                  });
                }}
                className="rounded-md p-1.5 text-muted-foreground hover:text-brand"
              >
                <Edit3 className="size-4" />
              </button>
              <button onClick={() => remove(lab.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          </AdminCard>
        ))}
        {labs.length === 0 ? (
          <p className="rounded-xl bg-surface p-8 text-center text-sm text-muted-foreground ring-1 ring-hairline">
            No labs for this track yet — create the first one above.
          </p>
        ) : null}
      </div>

      {activeCourse ? (
        <div className="mt-6 flex gap-4 text-sm">
          <Link to="/admin/curriculum/$id" params={{ id: activeCourse }} className="text-brand hover:underline">
            Edit curriculum →
          </Link>
          <Link to="/admin/courses" search={{ kind: "course" }} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ExternalLink className="size-3.5" /> Catalog
          </Link>
        </div>
      ) : null}
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

function Area({ label, value, onChange, rows = 3, full }: { label: string; value: string; onChange: (v: string) => void; rows?: number; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : undefined}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
      />
    </div>
  );
}
