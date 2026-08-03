import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { UserCircle2, FileText, Upload, Trash2, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+92");
  const [businessEmail, setBusinessEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeMsg, setResumeMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setHeadline(profile.headline ?? "");
    setBio(profile.bio ?? "");
    setPhone(profile.phone ?? "");
    setCountryCode(profile.country_code ?? "+92");
    setBusinessEmail(profile.business_email ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
    setResumePath(profile.resume_url ?? null);
    setResumeName(profile.resume_name ?? null);
  }, [profile]);

  async function onResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setResumeMsg("");
    if (file.size > 5 * 1024 * 1024) { setResumeMsg("Resume must be under 5 MB."); return; }
    setResumeBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${user.id}/resume.${ext}`;
    const up = await supabase.storage.from("resumes").upload(path, file, { upsert: true, contentType: file.type });
    if (up.error) { setResumeBusy(false); setResumeMsg(up.error.message); return; }
    const { error: dbErr } = await supabase.from("profiles").update({ resume_url: path, resume_name: file.name }).eq("id", user.id);
    setResumeBusy(false);
    if (dbErr) { setResumeMsg(dbErr.message); return; }
    setResumePath(path);
    setResumeName(file.name);
    setResumeMsg("Resume uploaded.");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function onResumeDownload() {
    if (!resumePath) return;
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(resumePath, 60);
    if (error || !data) { setResumeMsg(error?.message ?? "Could not open resume."); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function onResumeRemove() {
    if (!user || !resumePath) return;
    setResumeBusy(true);
    await supabase.storage.from("resumes").remove([resumePath]);
    await supabase.from("profiles").update({ resume_url: null, resume_name: null }).eq("id", user.id);
    setResumeBusy(false);
    setResumePath(null);
    setResumeName(null);
    setResumeMsg("Resume removed.");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy(true);
    // Convert to data URL — simple, no storage bucket dependency.
    const reader = new FileReader();
    reader.onload = () => { setAvatarUrl(reader.result as string); setBusy(false); };
    reader.readAsDataURL(file);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true); setError(""); setSaved(false);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      headline,
      bio,
      phone,
      country_code: countryCode,
      business_email: businessEmail || null,
      avatar_url: avatarUrl || null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setSaved(true);
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Account" title="Profile management" description="Update your public bio, avatar, and contact details." />
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-6">
          <form onSubmit={onSave} className="space-y-6 rounded-2xl bg-surface p-8 ring-1 ring-hairline">
            <div className="flex items-center gap-5">
              <div className="grid size-20 place-items-center overflow-hidden rounded-full bg-background ring-1 ring-hairline">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="size-full object-cover" /> : <UserCircle2 className="size-10 text-muted-foreground" />}
              </div>
              <div>
                <label className="cursor-pointer rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground ring-1 ring-hairline hover:bg-surface-2">
                  Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
                <p className="mt-2 text-[11px] text-muted-foreground">PNG or JPG, up to ~2MB.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" value={fullName} onChange={setFullName} required />
              <Field label="Headline (e.g. SOC Analyst)" value={headline} onChange={setHeadline} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Short bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
            </div>
            <div className="grid gap-4 md:grid-cols-[8rem_1fr]">
              <Field label="Country code" value={countryCode} onChange={setCountryCode} />
              <Field label="Phone" value={phone} onChange={setPhone} />
            </div>
            <Field label="Business email" value={businessEmail} onChange={setBusinessEmail} type="email" />
            <div>
              <label className="text-xs font-medium text-muted-foreground">Sign-in email</label>
              <input value={user?.email ?? ""} readOnly className="mt-1 w-full rounded-md bg-background/60 px-3 py-2 text-sm text-muted-foreground ring-1 ring-hairline" />
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            {saved ? <p className="text-xs text-brand">Profile saved.</p> : null}
            <button type="submit" disabled={busy} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand disabled:opacity-50">
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>

          <div className="mt-8 rounded-2xl bg-surface p-8 ring-1 ring-hairline">
            <h2 className="text-sm font-semibold text-foreground">Resume / CV</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload your CV so mentors and hiring partners can review it. PDF or Word, up to 5 MB. Only you and platform admins can access it.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground ring-1 ring-hairline hover:bg-surface-2">
                <Upload className="size-4" /> {resumePath ? "Replace resume" : "Upload resume"}
                <input type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" onChange={onResumeUpload} disabled={resumeBusy} />
              </label>
              {resumePath ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-md bg-background px-3 py-2 text-xs text-muted-foreground ring-1 ring-hairline">
                    <FileText className="size-3.5 text-brand" /> {resumeName ?? "resume"}
                  </span>
                  <button type="button" onClick={onResumeDownload} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
                    <Download className="size-3.5" /> View
                  </button>
                  <button type="button" onClick={onResumeRemove} disabled={resumeBusy} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </>
              ) : null}
            </div>
            {resumeMsg ? <p className="mt-3 text-xs text-muted-foreground">{resumeMsg}</p> : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} required={required} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
    </div>
  );
}