import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { DEFAULT_MENTOR, type Mentor } from "@/hooks/use-mentor";

export const Route = createFileRoute("/_authenticated/admin/mentor")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminMentor,
});

function AdminMentor() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Mentor>(DEFAULT_MENTOR);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-mentor"],
    queryFn: async () => (await supabase.from("site_content").select("value").eq("key", "mentor").maybeSingle()).data,
  });

  useEffect(() => {
    if (data?.value) setForm({ ...DEFAULT_MENTOR, ...(data.value as Partial<Mentor>) });
  }, [data]);

  async function save() {
    setSaving(true); setMsg(null);
    const { error } = await supabase.from("site_content").upsert({ key: "mentor", value: form as unknown as Record<string, unknown> });
    setSaving(false);
    if (error) { setMsg({ kind: "err", text: error.message }); return; }
    setMsg({ kind: "ok", text: "Mentor details updated." });
    qc.invalidateQueries({ queryKey: ["site_content", "mentor"] });
    qc.invalidateQueries({ queryKey: ["admin-mentor"] });
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg({ kind: "err", text: "Image must be under 2 MB." }); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo_url: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Admin · Content" title="Mentor profile" description="Edit the mentor photo, name, headline, biography, and stats shown on the About and Home pages." />
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <Link to="/admin" className="mb-6 inline-block text-sm text-brand hover:underline">← Back to admin</Link>

          <div className="grid gap-8 rounded-2xl bg-surface p-6 ring-1 ring-hairline md:grid-cols-[220px_1fr]">
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl ring-1 ring-hairline">
                <img src={form.photo_url} alt={form.name} className="aspect-[4/5] w-full object-cover" />
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-background px-3 py-2 text-xs font-medium text-foreground ring-1 ring-hairline hover:bg-surface-2">
                <Upload className="size-3.5" /> Upload new photo
                <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
              </label>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Or photo URL</label>
                <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-xs ring-1 ring-hairline" />
              </div>
            </div>

            <div className="grid gap-4">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Headline / title" value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Biography</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={8}
                  className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Stats</label>
                  <button onClick={() => setForm({ ...form, stats: [...form.stats, { k: "", v: "" }] })} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                    <Plus className="size-3.5" /> Add stat
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.stats.map((s, i) => (
                    <div key={i} className="grid grid-cols-[100px_1fr_auto] gap-2">
                      <input value={s.k} onChange={(e) => updateStat(setForm, i, { k: e.target.value })} placeholder="25+" className="rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline" />
                      <input value={s.v} onChange={(e) => updateStat(setForm, i, { v: e.target.value })} placeholder="Years experience" className="rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline" />
                      <button onClick={() => setForm({ ...form, stats: form.stats.filter((_, j) => j !== i) })} className="rounded-md p-2 text-muted-foreground hover:bg-background hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand disabled:opacity-60">
                  <Save className="size-4" /> {saving ? "Saving…" : "Save changes"}
                </button>
                {msg ? <span className={`text-xs ${msg.kind === "ok" ? "text-brand" : "text-destructive"}`}>{msg.text}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function updateStat(setForm: React.Dispatch<React.SetStateAction<Mentor>>, i: number, patch: Partial<{ k: string; v: string }>) {
  setForm((f) => ({ ...f, stats: f.stats.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
    </div>
  );
}