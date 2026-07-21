import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { BadgeCheck } from "lucide-react";

const TRACKS: { code: string; name: string; hours: number }[] = [
  { code: "CISSP", name: "Certified Information Systems Security Professional", hours: 64 },
  { code: "CISM", name: "Certified Information Security Manager", hours: 52 },
  { code: "CISA", name: "Certified Information Systems Auditor", hours: 48 },
  { code: "Security+", name: "CompTIA Security+", hours: 42 },
  { code: "CEH", name: "Certified Ethical Hacker v12", hours: 60 },
  { code: "CCSP", name: "Certified Cloud Security Professional", hours: 54 },
  { code: "AWS Sec", name: "AWS Certified Security Specialty", hours: 48 },
  { code: "Azure Sec", name: "Microsoft Azure Security Engineer", hours: 46 },
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
        <div className="mx-auto grid max-w-7xl gap-4 px-6">
          {TRACKS.map((t) => {
            const course = certCourses.find((c) => c.cert_code === t.code);
            return (
              <div
                key={t.code}
                className="group flex flex-col justify-between gap-6 rounded-xl bg-surface p-6 ring-1 ring-hairline transition-colors hover:ring-brand/40 md:flex-row md:items-center md:p-8"
              >
                <div className="flex items-center gap-6">
                  <div className="grid size-16 shrink-0 place-items-center rounded-md bg-brand/10 ring-1 ring-brand/20">
                    <BadgeCheck className="size-6 text-brand" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold tracking-widest text-brand uppercase">{t.code}</div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{t.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t.hours}h content · Exam simulator included</p>
                  </div>
                </div>
                <div>
                  <Link
                    to="/auth"
                    search={{ mode: "register" }}
                    className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand"
                  >
                    Start Track {course ? `— $${(course.price_cents / 100).toFixed(0)}` : ""}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}