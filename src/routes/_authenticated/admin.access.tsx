import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/admin/AdminPage";
import { Search, UserPlus, Trash2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/access")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminAccess,
});

function AdminAccess() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; full_name: string | null; business_email: string | null } | null>(null);
  const [courseId, setCourseId] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const { data: courses = [] } = useQuery({
    queryKey: ["access-courses"],
    queryFn: async () => (await supabase.from("courses").select("id, title, is_certification").order("title")).data ?? [],
  });

  const { data: results = [] } = useQuery({
    queryKey: ["access-search", query],
    enabled: query.trim().length >= 2,
    queryFn: async () => {
      const q = query.trim();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, business_email, phone")
        .or(`full_name.ilike.%${q}%,business_email.ilike.%${q}%,id.eq.${isUuid(q) ? q : "00000000-0000-0000-0000-000000000000"}`)
        .limit(20);
      return data ?? [];
    },
  });

  const { data: userEnrollments = [] } = useQuery({
    queryKey: ["access-enrollments", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, enrolled_at, progress_percent, course:courses(id, title)")
        .eq("user_id", selectedUser!.id);
      return data ?? [];
    },
  });

  async function grant() {
    setMsg(null);
    if (!selectedUser || !courseId) {
      setMsg({ kind: "err", text: "Select a user and a course first." });
      return;
    }
    const { error } = await supabase.from("enrollments").insert({ user_id: selectedUser.id, course_id: courseId });
    if (error) {
      setMsg({ kind: "err", text: error.message.includes("duplicate") ? "User is already enrolled in this course." : error.message });
      return;
    }
    setMsg({ kind: "ok", text: "Access granted." });
    qc.invalidateQueries({ queryKey: ["access-enrollments", selectedUser.id] });
  }

  async function revoke(id: string) {
    if (!confirm("Revoke access to this course?")) return;
    await supabase.from("enrollments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["access-enrollments", selectedUser?.id] });
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Admin · Access" title="Grant course access" description="Manually enroll any user in any course or certification." />
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <Link to="/admin" className="mb-6 inline-block text-sm text-brand hover:underline">← Back to admin</Link>

          <div className="rounded-2xl bg-surface p-6 ring-1 ring-hairline">
            <label className="text-xs font-medium text-muted-foreground">Find user (name, business email, or user ID)</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedUser(null); }}
                placeholder="e.g. jane@company.com or Jane Doe"
                className="w-full rounded-md bg-background py-2 pl-9 pr-3 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
              />
            </div>

            {query.trim().length >= 2 && !selectedUser ? (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-md ring-1 ring-hairline">
                {results.length === 0 ? (
                  <p className="p-4 text-xs text-muted-foreground">No matches. Try a business email or paste the user ID.</p>
                ) : results.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="flex w-full items-center justify-between border-b border-hairline px-4 py-3 text-left text-sm last:border-0 hover:bg-background"
                  >
                    <div>
                      <div className="font-medium text-foreground">{u.full_name ?? "Unnamed user"}</div>
                      <div className="text-[11px] text-muted-foreground">{u.business_email ?? u.id}</div>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-brand uppercase">Select</span>
                  </button>
                ))}
              </div>
            ) : null}

            {selectedUser ? (
              <div className="mt-6 rounded-lg bg-background p-4 ring-1 ring-hairline">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-brand uppercase">Selected user</div>
                    <div className="mt-1 text-base font-semibold text-foreground">{selectedUser.full_name ?? "Unnamed user"}</div>
                    <div className="text-xs text-muted-foreground">{selectedUser.business_email ?? selectedUser.id}</div>
                  </div>
                  <button onClick={() => { setSelectedUser(null); setQuery(""); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <label className="text-xs font-medium text-muted-foreground">Course / certification</label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm ring-1 ring-hairline"
                    >
                      <option value="">Select a course…</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.is_certification ? "🎓 " : ""}{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={grant} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">
                    <UserPlus className="size-4" /> Grant access
                  </button>
                </div>

                {msg ? (
                  <p className={`mt-3 text-xs ${msg.kind === "ok" ? "text-brand" : "text-destructive"}`}>{msg.text}</p>
                ) : null}

                <div className="mt-6">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    <KeyRound className="size-3" /> Current access
                  </div>
                  {userEnrollments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No enrollments yet.</p>
                  ) : (
                    <div className="divide-y divide-hairline rounded-md ring-1 ring-hairline">
                      {userEnrollments.map((e) => {
                        const c = e.course as { id: string; title: string } | null;
                        return (
                          <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                            <div>
                              <div className="font-medium text-foreground">{c?.title ?? "—"}</div>
                              <div className="text-[11px] text-muted-foreground">{e.progress_percent}% · enrolled {new Date(e.enrolled_at).toLocaleDateString()}</div>
                            </div>
                            <button onClick={() => revoke(e.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-destructive">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}