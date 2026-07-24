import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { BadgeCheck, Clock, FlaskConical, Trophy, Briefcase, Target, GraduationCap } from "lucide-react";

type Track = {
  code: string;
  name: string;
  hours: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  labs: number;
  projects: number;
  simulator: boolean;
  salary: string;
  paths: string[];
};
const TRACKS: Track[] = [
  { code: "CISSP", name: "Certified Information Systems Security Professional", hours: 64, difficulty: "Expert", labs: 24, projects: 8, simulator: true, salary: "$120k–$185k", paths: ["Security Architect", "CISO"] },
  { code: "CISM", name: "Certified Information Security Manager", hours: 52, difficulty: "Advanced", labs: 18, projects: 6, simulator: true, salary: "$115k–$170k", paths: ["Security Manager", "GRC Lead"] },
  { code: "CISA", name: "Certified Information Systems Auditor", hours: 48, difficulty: "Advanced", labs: 16, projects: 5, simulator: true, salary: "$95k–$150k", paths: ["IT Auditor", "Compliance Lead"] },
  { code: "Security+", name: "CompTIA Security+", hours: 42, difficulty: "Beginner", labs: 22, projects: 5, simulator: true, salary: "$70k–$110k", paths: ["SOC Analyst", "Jr. Security Engineer"] },
  { code: "CEH", name: "Certified Ethical Hacker v12", hours: 60, difficulty: "Intermediate", labs: 40, projects: 10, simulator: true, salary: "$85k–$140k", paths: ["Pen Tester", "Red Team"] },
  { code: "CCSP", name: "Certified Cloud Security Professional", hours: 54, difficulty: "Advanced", labs: 20, projects: 6, simulator: true, salary: "$130k–$180k", paths: ["Cloud Security Architect"] },
  { code: "AWS Sec", name: "AWS Certified Security Specialty", hours: 48, difficulty: "Advanced", labs: 26, projects: 7, simulator: true, salary: "$125k–$175k", paths: ["Cloud Security Engineer"] },
  { code: "Azure Sec", name: "Microsoft Azure Security Engineer", hours: 46, difficulty: "Intermediate", labs: 24, projects: 7, simulator: true, salary: "$115k–$165k", paths: ["Azure Security Engineer"] },
];

export const Route = createFileRoute("/certifications")({
  head: () => ({
    meta: [
      { title: "Certifications — AI Security Hub" },
      { name: "description", content: "Prep tracks for CISSP, CISM, CEH, CCSP, Security+, and AWS/Azure security certifications." },
      { property: "og:title", content: "Certifications — AI Security Hub" },
      { property: "og:description", content: "Prep tracks for the industry's most rigorous security certifications." },
    ],
  }),
  component: CertificationsPage,
});

function CertificationsPage() {
  const { data: certCourses = [] } = useQuery({
    queryKey: ["cert-courses"],
    queryFn: async () =>
      (await supabase.from("courses").select("id, slug, title, cert_code, lesson_count, price_cents").eq("published", true).eq("is_certification", true)).data ?? [],
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Certification Tracks"
        title="Elite Certification Excellence"
        description="Full-domain preparation with simulated labs and exam simulators for the industry's most rigorous credentials."
      />
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2">
          {TRACKS.map((t) => {
            const course = certCourses.find((c) => c.cert_code === t.code);
            return (
              <div
                key={t.code}
                className="group flex flex-col gap-5 rounded-xl bg-surface p-6 ring-1 ring-hairline transition-colors hover:ring-brand/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid size-14 shrink-0 place-items-center rounded-md bg-brand/10 ring-1 ring-brand/20">
                      <BadgeCheck className="size-6 text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold tracking-widest text-brand uppercase">{t.code}</div>
                      <h3 className="mt-1 text-base font-semibold text-foreground">{t.name}</h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-background px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase ring-1 ring-hairline">{t.difficulty}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Stat icon={Clock} label="Study hours" value={`${t.hours}h`} />
                  <Stat icon={FlaskConical} label="Practice labs" value={String(t.labs)} />
                  <Stat icon={Target} label="Projects" value={String(t.projects)} />
                  <Stat icon={Trophy} label="Exam simulator" value={t.simulator ? "Included" : "—"} />
                  <Stat icon={Briefcase} label="Salary range" value={t.salary} />
                  <Stat icon={GraduationCap} label="Career paths" value={t.paths.join(", ")} />
                </div>
                <div className="flex items-center justify-between border-t border-hairline pt-4">
                  <span className="text-sm font-semibold text-foreground">{course ? `$${(course.price_cents / 100).toFixed(0)}` : "—"}</span>
                  <Link to="/auth" search={{ mode: "register" }} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand">Start track</Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background p-3 ring-1 ring-hairline">
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        <Icon className="size-3 text-brand" /> {label}
      </div>
      <div className="mt-1 text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}