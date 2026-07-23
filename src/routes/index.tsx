import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { useMentor } from "@/hooks/use-mentor";
import {
  Shield,
  Cloud,
  Cpu,
  Terminal,
  KeyRound,
  Code2,
  Network,
  Mail,
  Flame,
  Laptop,
  Database,
  Braces,
  GitBranch,
  Activity,
  Bot,
  Sparkles,
  BrainCircuit,
  BadgeCheck,
  Award,
  ClipboardCheck,
  Lock,
  Bug,
  Server,
  Waypoints,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "cybersecurity-fundamentals": Shield,
  "network-security": Network,
  "email-security": Mail,
  "firewall-security": Flame,
  "endpoint-security": Laptop,
  "data-security": Database,
  "cloud-security": Cloud,
  iam: KeyRound,
  "web-security": Code2,
  "api-security": Braces,
  devsecops: GitBranch,
  soc: Activity,
  "ethical-hacking": Bug,
  "ai-security": BrainCircuit,
  "generative-ai-security": Sparkles,
  "ai-for-cybersecurity": Bot,
  cissp: BadgeCheck,
  cism: Award,
  cisa: ClipboardCheck,
  "security-plus": Shield,
  ceh: Terminal,
  ccsp: Cloud,
  "aws-security": Server,
  "azure-security": Waypoints,
};

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const mentor = useMentor();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["home-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, slug, title, subtitle, price_cents, lesson_count, level, is_certification")
        .eq("published", true)
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative border-b border-hairline py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--brand)_18%,transparent)_0%,transparent_45%),radial-gradient(circle_at_80%_0%,color-mix(in_oklab,var(--brand)_10%,transparent)_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <span className="inline-flex w-fit items-center rounded-full bg-brand/10 px-3 py-1 text-[11px] font-medium tracking-wider text-brand uppercase ring-1 ring-brand/20">
            Defensive Intelligence · v1.0
          </span>
          <h1 className="mt-6 max-w-[20ch] text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            Master Cybersecurity, Cloud &amp; AI Skills for the Future.
          </h1>
          <p className="mt-5 max-w-[56ch] text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Advanced offensive and defensive security training designed for the age of autonomous
            threats. From CISSP mastery to Generative AI red-teaming.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand"
            >
              View Curriculum
            </Link>
            <Link
              to="/contact"
              className="rounded-md bg-surface px-6 py-2.5 text-sm font-medium text-foreground ring-1 ring-hairline transition-colors hover:bg-surface-2"
            >
              Request Enterprise Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="border-b border-hairline bg-background/50 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4 lg:grid-cols-6">
          {["Defensify", "QuantSecure", "NeuralShield", "ApexRoot", "IronLogic", "CoreBuffer"].map((n) => (
            <div key={n} className="flex items-center justify-center opacity-40 transition-opacity hover:opacity-100">
              <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                {n}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col gap-3">
            <h2 className="text-balance max-w-[40ch] text-3xl font-semibold tracking-tight text-foreground">
              Knowledge Domains
            </h2>
            <p className="max-w-[56ch] text-sm text-muted-foreground">
              Explore 24 specialized paths across the full stack of modern cybersecurity and AI
              governance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hairline ring-1 ring-hairline sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Shield;
              return (
                <Link
                  key={cat.id}
                  to="/courses"
                  search={{ category: cat.slug }}
                  className="group flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-surface"
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-surface ring-1 ring-hairline group-hover:ring-brand/40">
                    <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-brand" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Featured Curriculums
              </h2>
              <p className="mt-2 max-w-[56ch] text-sm text-muted-foreground">
                Industry-standard training modules led by principal security engineers.
              </p>
            </div>
            <Link to="/courses" className="hidden text-sm font-medium text-brand hover:underline sm:block">
              Explore all courses →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <article
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-hairline transition-all hover:ring-brand/40"
              >
                <div className="aspect-video w-full bg-gradient-to-br from-brand/20 via-surface to-surface-2" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-brand uppercase">
                      {c.is_certification ? "Certification" : c.level}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {c.lesson_count} Lessons
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                  <p className="text-pretty text-sm text-muted-foreground">{c.subtitle}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4">
                    <span className="text-sm font-semibold text-foreground">
                      ${(c.price_cents / 100).toFixed(2)}
                    </span>
                    <Link to="/courses" className="text-sm font-medium text-brand hover:text-brand/80">
                      Enroll →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-brand">About the Platform</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Built by practitioners. Guided by 25+ years of experience.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                AI Security Hub is founded by a technology enthusiast and AI developer, mentored
                by a senior cybersecurity consultant with more than two and a half decades of
                enterprise experience. Together we design curriculum that reflects the reality of
                modern SOCs — not textbook theory.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/about"
                  className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand"
                >
                  Read our story
                </Link>
                <Link
                  to="/about"
                  hash="mentor"
                  className="rounded-md bg-surface px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-hairline transition-colors hover:bg-surface-2"
                >
                  Meet our mentor
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="overflow-hidden rounded-2xl ring-1 ring-hairline">
                <img
                  src={mentorPhoto}
                  alt="AI Security Hub mentor — 25+ years cybersecurity consulting"
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-hairline bg-surface p-5">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-brand">Our Mentor</div>
                  <p className="mt-2 text-sm font-medium text-foreground">Senior Cybersecurity Consultant</p>
                  <p className="mt-1 text-xs text-muted-foreground">CISSP · CISM · CISA · ISO 27001</p>
                </div>
                <div className="rounded-2xl border border-hairline bg-surface p-5">
                  <div className="text-3xl font-semibold text-foreground">25+</div>
                  <div className="mt-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Years of enterprise experience</div>
                </div>
                <div className="rounded-2xl border border-hairline bg-surface p-5">
                  <div className="text-3xl font-semibold text-foreground">500+</div>
                  <div className="mt-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Practitioners mentored</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification callout */}
      <section className="py-24">
        <div className="mx-auto mb-24 max-w-7xl px-6">
          <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-surface to-background p-8 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <span className="inline-flex items-center rounded-full bg-brand/15 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-brand ring-1 ring-brand/30">
                  Free Masterclass · Lead-Gen for Careers
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  The Cybersecurity Career Masterclass — 100% Free.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:text-base">
                  We built a free masterclass to help thousands break into cybersecurity. It covers the global
                  demand for cyber talent, the real career paths beginners overlook, how AI is reshaping the
                  industry, and a step-by-step learning roadmap you can start this week.
                </p>
                <ul className="mt-6 grid gap-2 text-sm text-foreground/90 sm:grid-cols-2">
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> Global demand & salaries</li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> Career paths that hire beginners</li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> AI vs. defenders in 2026</li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> A guided learning roadmap</li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/auth" search={{ mode: "register" }} className="rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand">
                    Reserve free seat
                  </Link>
                  <Link to="/about" className="rounded-md bg-surface px-6 py-2.5 text-sm font-medium text-foreground ring-1 ring-hairline hover:bg-surface-2">
                    What's inside →
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: "Free", v: "Zero cost, forever" },
                  { k: "60 min", v: "Career-defining session" },
                  { k: "1:1", v: "Founder-led Q&A" },
                  { k: "500+", v: "Practitioners already enrolled" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-background/60 p-5 ring-1 ring-hairline">
                    <div className="text-2xl font-semibold text-foreground">{s.k}</div>
                    <div className="mt-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-hairline bg-gradient-to-b from-surface to-background p-8 lg:p-12">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Certification Excellence
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  We partner with global credentialing bodies to provide simulated labs and
                  comprehensive theory for the industry&apos;s most rigorous certifications.
                </p>
                <ul className="flex flex-col gap-3 text-sm text-foreground/90">
                  <li className="flex items-center gap-3"><span className="size-1 rounded-full bg-brand" /> CISSP Prep Track</li>
                  <li className="flex items-center gap-3"><span className="size-1 rounded-full bg-brand" /> CEH Practical Labs</li>
                  <li className="flex items-center gap-3"><span className="size-1 rounded-full bg-brand" /> CISM Management Bootcamp</li>
                  <li className="flex items-center gap-3"><span className="size-1 rounded-full bg-brand" /> AWS &amp; Azure Security Specialties</li>
                </ul>
                <Link
                  to="/certifications"
                  className="w-fit rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand"
                >
                  View Tracks
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {["CISSP", "CISM", "CEH", "Security+", "CCSP", "AWS Sec"].map((c) => (
                  <div
                    key={c}
                    className="grid aspect-square place-items-center rounded-xl bg-background/60 ring-1 ring-hairline"
                  >
                    <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                      <Lock className="size-3 text-brand" /> {c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
