import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Plus, Trash2, Eye, EyeOff, Edit3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminCourses,
});

function AdminCourses() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    slug: string; title: string; subtitle: string; description: string;
    level: "beginner" | "intermediate" | "advanced"; price_cents: number; lesson_count: number; duration_minutes: number;
    is_certification: boolean; published: boolean;
  }>({
    slug: "", title: "", subtitle: "", description: "",
    level: "beginner", price_cents: 29900, lesson_count: 20, duration_minutes: 900,
    is_certification: false, published: true,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => (await supabase.from("courses").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  function resetForm() {
    setForm({ slug: "", title: "", subtitle: "", description: "", level: "beginner", price_cents: 29900, lesson_count: 20, duration_minutes: 900, is_certification: false, published: true });
    setEditingId(null);
    setCreating(false);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from("courses").update(form).eq("id", editingId);
    } else {
      await supabase.from("courses").insert(form);
    }
    resetForm();
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    await supabase.from("courses").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  async function togglePublish(id: string, published: boolean) {
    await supabase.from("courses").update({ published: !published }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  function startEdit(c: typeof courses[number]) {
    setForm({
      slug: c.slug, title: c.title, subtitle: c.subtitle ?? "", description: c.description ?? "",
      level: c.level, price_cents: c.price_cents, lesson_count: c.lesson_count, duration_minutes: c.duration_minutes,
      is_certification: c.is_certification, published: c.published,
    });
    setEditingId(c.id);
    setCreating(true);
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Admin · Catalog" title="Courses & Certifications" description="Create, edit, publish, or remove learning products." />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/admin" className="text-sm text-brand hover:underline">← Back to admin</Link>
            <button onClick={() => { resetForm(); setCreating(true); }} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
              <Plus className="size-4" /> New course
            </button>
          </div>

          {creating ? (
            <form onSubmit={onSave} className="mb-8 grid gap-4 rounded-2xl bg-surface p-6 ring-1 ring-hairline md:grid-cols-2">
              <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
              <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <Input label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Level</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as "beginner" | "intermediate" | "advanced" })} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <Input label="Price (cents)" type="number" value={String(form.price_cents)} onChange={(v) => setForm({ ...form, price_cents: Number(v) })} />
              <Input label="Lessons" type="number" value={String(form.lesson_count)} onChange={(v) => setForm({ ...form, lesson_count: Number(v) })} />
              <Input label="Duration (min)" type="number" value={String(form.duration_minutes)} onChange={(v) => setForm({ ...form, duration_minutes: Number(v) })} />
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline" />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.is_certification} onChange={(e) => setForm({ ...form, is_certification: e.target.checked })} /> Certification track</label>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">{editingId ? "Update course" : "Create course"}</button>
                <button type="button" onClick={resetForm} className="rounded-md bg-background px-5 py-2 text-sm ring-1 ring-hairline">Cancel</button>
              </div>
            </form>
          ) : null}

          <div className="rounded-xl bg-surface ring-1 ring-hairline">
            {courses.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 border-b border-hairline px-5 py-3 text-sm last:border-0">
                <div>
                  <div className="font-medium text-foreground">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground">{c.slug} · {c.is_certification ? "Certification" : "Course"}</div>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{c.level}</span>
                <span className="text-xs text-muted-foreground">{c.lesson_count} lessons</span>
                <span className="text-xs font-medium text-foreground">${(c.price_cents / 100).toFixed(0)}</span>
                <button onClick={() => togglePublish(c.id, c.published)} title={c.published ? "Unpublish" : "Publish"} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-brand">
                  {c.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(c)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-brand"><Edit3 className="size-4" /></button>
                  <button onClick={() => onDelete(c.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
            {courses.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No courses yet.</p> : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} required={required} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
    </div>
  );
}