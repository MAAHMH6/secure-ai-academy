import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Plus, Trash2, Edit3, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/blogs")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminBlogs,
});

function AdminBlogs() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ slug: "", title: "", excerpt: "", content: "", category: "Threats", published: true });

  const { data: posts = [] } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  function resetForm() { setForm({ slug: "", title: "", excerpt: "", content: "", category: "Threats", published: true }); setEditingId(null); setCreating(false); }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, published_at: form.published ? new Date().toISOString() : null };
    if (editingId) await supabase.from("blog_posts").update(payload).eq("id", editingId);
    else await supabase.from("blog_posts").insert(payload);
    resetForm();
    qc.invalidateQueries({ queryKey: ["admin-blogs"] });
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-blogs"] });
  }

  async function togglePublish(id: string, published: boolean) {
    await supabase.from("blog_posts").update({ published: !published, published_at: !published ? new Date().toISOString() : null }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-blogs"] });
  }

  function startEdit(p: typeof posts[number]) {
    setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt ?? "", content: p.content ?? "", category: p.category, published: p.published });
    setEditingId(p.id);
    setCreating(true);
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Admin · Content" title="Blog posts" description="Publish research notes, threat intel, and study guides." />
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/admin" className="text-sm text-brand hover:underline">← Back to admin</Link>
            <button onClick={() => { resetForm(); setCreating(true); }} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
              <Plus className="size-4" /> New post
            </button>
          </div>

          {creating ? (
            <form onSubmit={onSave} className="mb-8 grid gap-4 rounded-2xl bg-surface p-6 ring-1 ring-hairline md:grid-cols-2">
              <FieldTxt label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
              <FieldTxt label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <FieldTxt label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} required />
              <label className="mt-6 flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Content (Markdown or plain text)</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm ring-1 ring-hairline font-mono" />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">{editingId ? "Update post" : "Publish post"}</button>
                <button type="button" onClick={resetForm} className="rounded-md bg-background px-5 py-2 text-sm ring-1 ring-hairline">Cancel</button>
              </div>
            </form>
          ) : null}

          <div className="rounded-xl bg-surface ring-1 ring-hairline">
            {posts.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-hairline px-5 py-3 text-sm last:border-0">
                <div>
                  <div className="font-medium text-foreground">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.slug} · {p.category}</div>
                </div>
                <button onClick={() => togglePublish(p.id, p.published)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-brand">
                  {p.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button onClick={() => startEdit(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-brand"><Edit3 className="size-4" /></button>
                <button onClick={() => onDelete(p.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            ))}
            {posts.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No posts yet.</p> : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function FieldTxt({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
    </div>
  );
}