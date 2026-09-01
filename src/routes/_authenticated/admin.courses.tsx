import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/admin/AdminPage";
import { formatPkr } from "@/lib/site-data";
import { fileToResizedDataUrl } from "@/lib/image-upload";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Edit3, Upload, ImageIcon } from "lucide-react";

type Kind = "course" | "certification" | "masterclass";
type DisplayStatus = "live" | "coming_soon" | "in_development";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  validateSearch: (s: Record<string, unknown>) => ({
    kind: (["course", "certification", "masterclass"].includes(String(s.kind)) ? String(s.kind) : "course") as Kind,
  }),
  component: AdminCourses,
});

function AdminCourses() {
  const qc = useQueryClient();
  const { kind } = Route.useSearch();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    slug: string; title: string; subtitle: string; description: string;
    level: "beginner" | "intermediate" | "advanced"; price_cents: number; lesson_count: number; duration_minutes: number; labs_count: number;
    is_certification: boolean; published: boolean; cover_url: string; cert_code: string;
    display_status: DisplayStatus; free_enroll: boolean;
  }>({
    slug: "", title: "", subtitle: "", description: "",
    level: "beginner", price_cents: 29900, lesson_count: 20, duration_minutes: 900, labs_count: 0,
    is_certification: false, published: true, cover_url: "", cert_code: "",
    display_status: "live", free_enroll: false,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses", kind],
    queryFn: async () =>
      (await supabase.from("courses").select("*").eq("kind", kind).order("created_at", { ascending: false })).data ?? [],
  });

  function resetForm() {
    setForm({
      slug: "", title: "", subtitle: "", description: "", level: "beginner", price_cents: 29900,
      lesson_count: 20, duration_minutes: 900, labs_count: 0, is_certification: false, published: true,
      cover_url: "", cert_code: "", display_status: "live", free_enroll: false,
    });
    setEditingId(null);
    setCreating(false);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      kind,
      is_certification: kind === "certification",
      cover_url: form.cover_url.trim() || null,
      cert_code: form.cert_code.trim() || null,
    };
    const { error } = editingId
      ? await supabase.from("courses").update(payload).eq("id", editingId)
      : await supabase.from("courses").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Changes saved" : `${kind} created`);
    resetForm();
    qc.invalidateQueries({ queryKey: ["admin-courses", kind] });
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-courses", kind] });
  }

  async function togglePublish(id: string, published: boolean) {
    const { error } = await supabase.from("courses").update({ published: !published }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-courses", kind] });
  }

  function startEdit(c: typeof courses[number]) {
    setForm({
      slug: c.slug, title: c.title, subtitle: c.subtitle ?? "", description: c.description ?? "",
      level: c.level as "beginner" | "intermediate" | "advanced", price_cents: c.price_cents, lesson_count: c.lesson_count, duration_minutes: c.duration_minutes, labs_count: c.labs_count ?? 0,
      is_certification: c.is_certification, published: c.published,
      cover_url: c.cover_url ?? "", cert_code: c.cert_code ?? "",
      display_status: (c.display_status ?? "live") as DisplayStatus, free_enroll: c.free_enroll ?? false,
    });
    setEditingId(c.id);
    setCreating(true);
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Learning"
        title={kind === "certification" ? "Certifications" : kind === "masterclass" ? "Masterclasses" : "Courses"}
        description="Create, edit, publish, or remove learning products, then build their curriculum."
      />
      <section className="py-12">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <Link to="/admin" className="text-sm text-brand hover:underline">← Back to dashboard</Link>
            <button onClick={() => { resetForm(); setCreating(true); }} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
              <Plus className="size-4" /> New {kind}
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
              <div>
                <label className="text-xs font-medium text-muted-foreground">Display status</label>
                <select value={form.display_status} onChange={(e) => setForm({ ...form, display_status: e.target.value as DisplayStatus })} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline">
                  <option value="live">Live · enroll open</option>
                  <option value="coming_soon">Coming soon</option>
                  <option value="in_development">In development</option>
                </select>
              </div>
              <Input label="Lessons" type="number" value={String(form.lesson_count)} onChange={(v) => setForm({ ...form, lesson_count: Number(v) })} />
              <Input label="Duration (min)" type="number" value={String(form.duration_minutes)} onChange={(v) => setForm({ ...form, duration_minutes: Number(v) })} />
              <Input label="Hands-on labs" type="number" value={String(form.labs_count)} onChange={(v) => setForm({ ...form, labs_count: Number(v) })} />
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Thumbnail</label>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background ring-1 ring-hairline">
                    {form.cover_url ? (
                      <img src={form.cover_url} alt="Thumbnail preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline hover:ring-brand">
                    <Upload className="size-4" /> Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        try {
                          setForm((f) => ({ ...f, cover_url: "" }));
                          const url = await fileToResizedDataUrl(file);
                          setForm((f) => ({ ...f, cover_url: url }));
                          toast.success("Thumbnail ready — save to apply");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Upload failed");
                        }
                      }}
                    />
                  </label>
                  <input
                    value={form.cover_url.startsWith("data:") ? "" : form.cover_url}
                    placeholder="…or paste an image URL"
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                    className="min-w-[12rem] flex-1 rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
                  />
                  {form.cover_url ? (
                    <button type="button" onClick={() => setForm({ ...form, cover_url: "" })} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive">
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
              {kind === "certification" ? (
                <Input label="Certification code (e.g. CISSP)" value={form.cert_code} onChange={(v) => setForm({ ...form, cert_code: v })} />
              ) : null}
              <p className="self-end text-xs text-muted-foreground md:col-span-2">
                Learners see {form.free_enroll || form.price_cents === 0 ? "Free" : `$${(form.price_cents / 100).toFixed(0)} · ${formatPkr(form.price_cents)}`}
              </p>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline" />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.free_enroll} onChange={(e) => setForm({ ...form, free_enroll: e.target.checked })} /> Free enrollment for everyone</label>
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">{editingId ? `Update ${kind}` : `Create ${kind}`}</button>
                <button type="button" onClick={resetForm} className="rounded-md bg-background px-5 py-2 text-sm ring-1 ring-hairline">Cancel</button>
              </div>
            </form>
          ) : null}

          <div className="rounded-xl bg-surface ring-1 ring-hairline">
            {courses.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto_auto] items-center gap-3 border-b border-hairline px-5 py-3 text-sm last:border-0">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-background ring-1 ring-hairline">
                    {c.cover_url ? <img src={c.cover_url} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{c.title}</div>
                    <div className="text-[11px] text-muted-foreground">{c.slug} · {c.kind}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{c.level}</span>
                <span className="text-xs text-muted-foreground">{c.lesson_count} lessons{(c.labs_count ?? 0) > 0 ? ` · ${c.labs_count} labs` : ""}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {c.display_status === "live" ? "" : c.display_status === "coming_soon" ? "Coming soon" : "In dev"}
                </span>
                <span className="text-xs font-medium text-foreground">{c.free_enroll ? "Free" : `$${(c.price_cents / 100).toFixed(0)}`}</span>
                <Link to="/admin/curriculum/$id" params={{ id: c.id }} className="rounded-md px-2 py-1 text-xs text-brand ring-1 ring-brand/30 hover:bg-brand/10">Curriculum</Link>
                <button onClick={() => togglePublish(c.id, c.published)} title={c.published ? "Unpublish" : "Publish"} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-brand">
                  {c.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(c)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-brand"><Edit3 className="size-4" /></button>
                  <button onClick={() => onDelete(c.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
            {courses.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Nothing here yet.</p> : null}
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