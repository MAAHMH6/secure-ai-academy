import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { useMentor } from "@/hooks/use-mentor";
import { Award, Briefcase, GraduationCap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AI Security Hub" },
      { name: "description", content: "AI Security Hub trains the next generation of cybersecurity practitioners for the age of autonomous threats." },
      { property: "og:title", content: "About — AI Security Hub" },
      { property: "og:description", content: "Our mission, values, and team." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const mentor = useMentor();
  return (
    <PageShell>
      <PageHeader eyebrow="About" title="Rigorous training for the age of autonomous threats." description="We build the standard curriculum for the practitioners defending the AI-powered economy." />
      {/* Mission + Values */}
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              AI Security Hub exists to close the widening gap between the pace of threat evolution
              and the depth of practitioner training. From SOC operations to adversarial ML, our
              curriculum is designed by principal security engineers and continuously updated as
              the threat landscape shifts.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">What we stand for</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li><span className="text-foreground">Depth over breadth.</span> We ship courses only when they hold up in a real SOC.</li>
              <li><span className="text-foreground">Lab-first.</span> Every technical concept is anchored by a hands-on exercise.</li>
              <li><span className="text-foreground">Practitioner authored.</span> One mentor and lead instructor — Shams Ejaz — authors and teaches every core track.</li>
            </ul>
          </div>
        </div>

        {/* Founder · Mentor · Lead Instructor (one person) */}
        <div id="mentor" className="mx-auto mt-24 max-w-7xl px-6">
          <div className="grid gap-12 rounded-2xl border border-hairline bg-gradient-to-b from-surface to-background p-8 lg:grid-cols-[0.9fr_1.5fr] lg:p-12">
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl ring-1 ring-hairline">
                <img
                  src={mentor.photo_url}
                  alt={`${mentor.name} — ${mentor.headline}`}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-xl bg-surface p-5 ring-1 ring-hairline">
                <div className="text-[10px] font-bold tracking-widest uppercase text-brand">Credentials</div>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><Award className="size-3.5 text-brand" /> CISSP · CISM · CISA</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-brand" /> ISO 27001 Lead Auditor</li>
                  <li className="flex items-center gap-2"><Briefcase className="size-3.5 text-brand" /> 25+ years enterprise consulting</li>
                  <li className="flex items-center gap-2"><GraduationCap className="size-3.5 text-brand" /> Guest lecturer · industry speaker</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-brand">Founder · Mentor &amp; Lead Instructor</div>
              <h3 className="mt-3 text-3xl font-semibold text-foreground">{mentor.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{mentor.headline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Cybersecurity Consulting", "AI Security", "Governance & Audit", "Mentorship"].map((t) => (
                  <span key={t} className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-medium text-brand ring-1 ring-brand/20">{t}</span>
                ))}
              </div>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                <p>{mentor.bio}</p>
                <p>
                  Every course, certification track, and lab on the platform is authored and
                  delivered by {mentor.name} — founder, mentor and lead instructor are one and the
                  same here, so what you learn comes straight from live enterprise engagements.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {mentor.stats.map((s) => (
                  <div key={s.v} className="rounded-xl border border-hairline bg-background p-4">
                    <div className="text-2xl font-semibold text-foreground">{s.k}</div>
                    <div className="mt-1 text-[10px] font-medium tracking-widest uppercase text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-7xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {[
            { k: "50k+", v: "Practitioners trained" },
            { k: "140+", v: "Courses & labs" },
            { k: "8", v: "Certification tracks" },
            { k: "24", v: "Knowledge domains" },
          ].map((s) => (
            <div key={s.v} className="rounded-xl border border-hairline bg-surface p-6">
              <div className="text-3xl font-semibold text-foreground">{s.k}</div>
              <div className="mt-1 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}