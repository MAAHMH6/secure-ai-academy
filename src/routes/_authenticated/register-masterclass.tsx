import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/register-masterclass")({
  head: () => ({
    meta: [
      { title: "Reserve Your Free Seat — AI Security Hub" },
      { name: "description", content: "Register for the free 60-minute Cybersecurity Career Masterclass and unlock the recorded sessions in your dashboard." },
      { property: "og:title", content: "Reserve Your Free Seat — AI Security Hub" },
      { property: "og:description", content: "Register for the free Cybersecurity Career Masterclass." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterMasterclass,
});

const MASTERCLASS_SLUG = "cybersecurity-career-masterclass";

const COUNTRIES = ["Pakistan", "India", "United Arab Emirates", "Saudi Arabia", "United Kingdom", "United States", "Canada", "Australia", "Germany", "Nigeria", "Other"];
const EXPERIENCE = ["Complete beginner", "Student", "1–2 years IT", "3–5 years IT", "5+ years IT", "Already in security"];
const DOMAINS = ["SOC / Blue Team", "Offensive Security", "Cloud Security", "AI Security", "GRC & Compliance", "Digital Forensics", "Not sure yet"];
const SOURCES = ["Instagram", "LinkedIn", "YouTube", "Google search", "Friend or colleague", "WhatsApp", "Other"];

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().max(20).optional(),
  country: z.string().min(1, "Select your country"),
  experience: z.string().min(1, "Select your experience level"),
  domain: z.string().min(1, "Select an area of interest"),
  roleTitle: z.string().trim().max(100).optional(),
  heardFrom: z.string().min(1, "Tell us how you found us"),
  goals: z.string().trim().max(500).optional(),
});

function RegisterMasterclass() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    countryCode: "+92",
    phone: "",
    country: "Pakistan",
    experience: "",
    domain: "",
    roleTitle: "",
    heardFrom: "",
    goals: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: course } = useQuery({
    queryKey: ["masterclass"],
    queryFn: async () =>
      (await supabase.from("courses").select("id, slug, title").eq("slug", MASTERCLASS_SLUG).maybeSingle()).data,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || profile.full_name || "",
      phone: f.phone || profile.phone || "",
      countryCode: profile.country_code || f.countryCode,
      country: profile.country || f.country,
      experience: profile.experience_level || f.experience,
      domain: profile.interested_domain || f.domain,
      roleTitle: profile.current_role_title || f.roleTitle,
    }));
  }, [profile]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !course) return;
    const parsed = schema.safeParse({
      fullName: form.fullName,
      phone: form.phone,
      country: form.country,
      experience: form.experience,
      domain: form.domain,
      roleTitle: form.roleTitle,
      heardFrom: form.heardFrom,
      goals: form.goals,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    setError("");

    const { error: regError } = await supabase.from("masterclass_registrations").upsert(
      {
        user_id: user.id,
        course_id: course.id,
        full_name: form.fullName,
        email: user.email ?? "",
        phone: form.phone || null,
        country_code: form.countryCode,
        country: form.country,
        experience_level: form.experience,
        interested_domain: form.domain,
        current_role_title: form.roleTitle || null,
        heard_from: form.heardFrom,
        goals: form.goals || null,
      },
      { onConflict: "user_id,course_id" },
    );
    if (regError) {
      setBusy(false);
      setError(regError.message);
      return;
    }

    await supabase
      .from("profiles")
      .update({
        full_name: form.fullName,
        phone: form.phone || null,
        country_code: form.countryCode,
        country: form.country,
        experience_level: form.experience,
        interested_domain: form.domain,
        current_role_title: form.roleTitle || null,
        lead_source: profile?.lead_source ?? form.heardFrom,
      })
      .eq("id", user.id);

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    if (!existing) {
      await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });
    }

    setBusy(false);
    navigate({ to: "/dashboard" });
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Free Masterclass"
        title="Reserve your free seat"
        description="Tell us a little about yourself so we can tailor the roadmap and follow-up resources to your goals. Takes under a minute."
      />
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-6">
          <form onSubmit={onSubmit} className="space-y-6 rounded-2xl bg-surface p-8 ring-1 ring-hairline">
            <div className="grid gap-4 md:grid-cols-2">
              <Text label="Full name" value={form.fullName} onChange={(v) => set("fullName", v)} required />
              <div>
                <Label>Email</Label>
                <input readOnly value={user?.email ?? ""} className="mt-1 w-full rounded-md bg-background/60 px-3 py-2 text-sm text-muted-foreground ring-1 ring-hairline" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[8rem_1fr]">
              <Text label="Country code" value={form.countryCode} onChange={(v) => set("countryCode", v)} />
              <Text label="WhatsApp / phone (optional)" value={form.phone} onChange={(v) => set("phone", v)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Country" value={form.country} onChange={(v) => set("country", v)} options={COUNTRIES} />
              <Select label="Experience level" value={form.experience} onChange={(v) => set("experience", v)} options={EXPERIENCE} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Area of interest" value={form.domain} onChange={(v) => set("domain", v)} options={DOMAINS} />
              <Text label="Current role / studies (optional)" value={form.roleTitle} onChange={(v) => set("roleTitle", v)} />
            </div>
            <Select label="How did you hear about us?" value={form.heardFrom} onChange={(v) => set("heardFrom", v)} options={SOURCES} />
            <div>
              <Label>What do you want to get out of this masterclass? (optional)</Label>
              <textarea
                value={form.goals}
                onChange={(e) => set("goals", e.target.value)}
                rows={4}
                maxLength={500}
                className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
              />
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground ring-1 ring-brand disabled:opacity-60"
            >
              {busy ? "Reserving your seat…" : "Finish & add to my dashboard"}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              100% free. No credit card. Recorded access forever.
            </p>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-muted-foreground">{children}</label>;
}

function Text({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}