import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { useMentor } from "@/hooks/use-mentor";
import {
  Shield, Cloud, Terminal, KeyRound, Code2, Network, Mail, Flame, Laptop,
  Database, Braces, GitBranch, Activity, Bot, Sparkles, BrainCircuit, BadgeCheck,
  Award, ClipboardCheck, Bug, Server, Waypoints, Star, Users, Clock, BookOpen,
  Target, FlaskConical, PlayCircle, Calendar, Trophy, TrendingUp, MessagesSquare,
  ChevronRight, Zap, GraduationCap, Rocket, Briefcase,
} from "lucide-react";
import { useState } from "react";
import heroSoc from "@/assets/hero-soc.jpg";
import masterclassImg from "@/assets/masterclass.jpg";
import { fallbackCover } from "@/lib/course-images";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "cybersecurity-fundamentals": Shield, "network-security": Network, "email-security": Mail,
  "firewall-security": Flame, "endpoint-security": Laptop, "data-security": Database,
  "cloud-security": Cloud, iam: KeyRound, "web-security": Code2, "api-security": Braces,
  devsecops: GitBranch, soc: Activity, "ethical-hacking": Bug, "ai-security": BrainCircuit,
  "generative-ai-security": Sparkles, "ai-for-cybersecurity": Bot, cissp: BadgeCheck,
  cism: Award, cisa: ClipboardCheck, "security-plus": Shield, ceh: Terminal, ccsp: Cloud,
  "aws-security": Server, "azure-security": Waypoints,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Security Hub — Cybersecurity, Cloud & AI Training" },
      { name: "description", content: "Free Cybersecurity Career Masterclass, hands-on courses, and elite certification prep — CISSP, CISM, CEH, CCSP and more." },
      { property: "og:title", content: "AI Security Hub" },
      { property: "og:description", content: "Master cybersecurity, cloud and AI. Start with our free career masterclass." },
    ],
  }),
  component: Home,
});

function Home() {
  const mentor = useMentor();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["home-courses"],
    queryFn: async () => (await supabase
      .from("courses")
      .select("id, slug, title, subtitle, price_cents, lesson_count, level, is_certification, cover_url")
      .eq("published", true).limit(6)).data ?? [],
  });

  return (
    <PageShell>
      {/* 1. Hero */}
      <section className="relative border-b border-hairline py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_18%_8%,color-mix(in_oklab,var(--brand)_14%,transparent)_0%,transparent_45%),radial-gradient(circle_at_82%_0%,color-mix(in_oklab,var(--brand)_8%,transparent)_0%,transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="reveal">
            <span className="inline-flex w-fit items-center rounded-full bg-brand/10 px-3 py-1 text-[11px] font-medium tracking-wider text-brand uppercase ring-1 ring-brand/20">
              Defensive Intelligence · v1.0
            </span>
            <h1 className="mt-6 max-w-[18ch] text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master Cybersecurity, Cloud &amp; AI Skills for the Future.
            </h1>
            <p className="mt-6 max-w-[52ch] text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Advanced offensive and defensive security training designed for the age of autonomous
              threats. Start with our free career masterclass.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/courses/$slug" params={{ slug: "cybersecurity-career-masterclass" }} className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground ring-1 ring-brand transition-colors hover:bg-brand/90">
                Reserve Free Seat
              </Link>
              <Link to="/courses" className="rounded-md bg-surface px-6 py-3 text-sm font-medium text-foreground ring-1 ring-hairline transition-colors hover:bg-surface-2">
                Explore Courses
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-6 gap-y-3 border-t border-hairline pt-7 sm:grid-cols-2">
              {[
                "Practical cybersecurity training",
                "Industry-led learning",
                "Career-focused programs",
                "Professional certification prep",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <ShieldCheckIcon /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal relative overflow-hidden rounded-2xl ring-1 ring-hairline [animation-delay:120ms]">
            <img
              src={heroSoc}
              alt="Enterprise security analysts monitoring threat intelligence dashboards in a security operations center"
              width={1408}
              height={1056}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* 2. Free Masterclass — headline lead-gen */}
      <section className="border-b border-hairline py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-brand/40 bg-gradient-to-br from-brand/15 via-surface to-background p-8 lg:p-14 shadow-[0_0_80px_-30px_var(--brand)]">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  {["FREE", "60 Minutes", "Recorded Access", "Beginner Friendly", "Career Roadmap"].map((b) => (
                    <span key={b} className="rounded-full bg-brand/15 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-brand ring-1 ring-brand/30">{b}</span>
                  ))}
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  The Cybersecurity Career Masterclass
                </h2>
                <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-muted-foreground lg:text-base">
                  A hand-crafted 60-minute masterclass covering global cyber demand, real career paths,
                  the beginner's roadmap, and how AI is reshaping the industry. Built to help thousands
                  break into cybersecurity — no cost, no catch.
                </p>
                <ul className="mt-6 grid gap-2 text-sm text-foreground/90 sm:grid-cols-2">
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> Global demand & salaries</li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> Career paths that hire beginners</li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> AI vs. defenders in 2026</li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-brand" /> A guided learning roadmap</li>
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/courses/$slug" params={{ slug: "cybersecurity-career-masterclass" }} className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground ring-1 ring-brand">
                    Reserve Free Seat
                  </Link>
                  <Link to="/pricing" className="rounded-md bg-background/60 px-6 py-3 text-sm font-medium text-foreground ring-1 ring-hairline hover:bg-surface-2">
                    View pricing
                  </Link>
                </div>
              </div>
              <div className="group relative aspect-video overflow-hidden rounded-xl bg-background/60 ring-1 ring-hairline">
                <img
                  src={masterclassImg}
                  alt="Cybersecurity instructor leading a professional enterprise training session"
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/40 to-background/10" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid size-20 place-items-center rounded-full bg-brand ring-8 ring-brand/20 transition-transform duration-300 group-hover:scale-105">
                    <PlayCircle className="size-10 text-brand-foreground" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 rounded-md bg-background/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand ring-1 ring-brand/30 backdrop-blur">
                  Live preview · Reserve to watch
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Registration CTA */}
      <section className="border-b border-hairline bg-surface/30 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 text-center">
          <span className="text-[10px] font-bold tracking-widest uppercase text-brand">Create your free account</span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Join 10,000+ practitioners already learning</h2>
          <p className="max-w-[56ch] text-sm text-muted-foreground">One free account unlocks the masterclass, our fundamentals course, community access, and your personal learning dashboard.</p>
          <Link to="/auth" search={{ mode: "register" }} className="mt-2 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground ring-1 ring-brand">
            Create free account
          </Link>
        </div>
      </section>

      {/* 4. Why Learn With AI Security Hub */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Why AI Security Hub" title="Enterprise-grade training, built by practitioners" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BrainCircuit, t: "AI-Powered Learning", d: "AI tutor, personalised recommendations, and adaptive quizzes for every learner." },
              { icon: FlaskConical, t: "Hands-On Labs", d: "Virtual security labs with real SOC tooling — not slideware." },
              { icon: Award, t: "Verified Certificates", d: "Course certificates plus full prep for CISSP, CISM, CEH, CCSP and more." },
              { icon: Users, t: "Mentor-Led", d: "Curriculum guided by a senior consultant with 25+ years of enterprise experience." },
            ].map((f) => (
              <div key={f.t} className="card-elevated rounded-xl bg-surface p-6 ring-1 ring-hairline hover:ring-brand/40">
                <span className="grid size-10 place-items-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                  <f.icon className="size-5 text-brand" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Knowledge Domains */}
      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="24 Knowledge Domains" title="Explore the full stack of cybersecurity" description="From SOC fundamentals to Generative AI red-teaming." />
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hairline ring-1 ring-hairline sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Shield;
              return (
                <Link key={cat.id} to="/courses" search={{ category: cat.slug }}
                  className="group flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-surface">
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

      {/* 6. Featured Courses */}
      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-brand">Featured Courses</span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Hands-on curriculums led by practitioners</h2>
            </div>
            <Link to="/courses" className="hidden text-sm font-medium text-brand hover:underline sm:block">Explore all →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <article key={c.id} className="card-elevated group flex flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-hairline hover:ring-brand/40">
                <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
                  <img
                    src={c.cover_url || fallbackCover(c.slug || c.title)}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-2 text-[10px] font-medium">
                    <span className="font-bold tracking-wider text-brand uppercase">{c.is_certification ? "Certification" : c.level}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground"><Star className="size-3 fill-brand text-brand" /> 4.8</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground"><Users className="size-3" /> {(1200 + (c.lesson_count * 137)) % 9000 + 500}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                  <p className="text-pretty text-sm text-muted-foreground">{c.subtitle}</p>
                  <div className="grid grid-cols-3 gap-2 border-t border-hairline pt-3 text-[10px] text-muted-foreground">
                    <div className="inline-flex items-center gap-1"><Clock className="size-3 text-brand" /> {Math.round(c.lesson_count * 0.75)}h</div>
                    <div className="inline-flex items-center gap-1"><BookOpen className="size-3 text-brand" /> {c.lesson_count} lessons</div>
                    <div className="inline-flex items-center gap-1"><Target className="size-3 text-brand" /> {Math.max(1, Math.floor(c.lesson_count / 8))} projects</div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4">
                    <span className="text-sm font-semibold text-foreground">${(c.price_cents / 100).toFixed(0)}</span>
                    <Link to="/auth" search={{ mode: "register" }} className="text-sm font-medium text-brand hover:text-brand/80">Enroll →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Certification Tracks */}
      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Certification Tracks" title="Elite certification excellence" description="Full-domain prep with simulated labs and exam simulators." />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {["CISSP","CISM","CISA","Security+","CEH","CCSP","AWS Sec","Azure Sec"].map((c) => (
              <div key={c} className="grid aspect-square place-items-center rounded-xl bg-surface ring-1 ring-hairline">
                <span className="flex flex-col items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  <BadgeCheck className="size-5 text-brand" /> {c}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/certifications" className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand">View all tracks</Link>
          </div>
        </div>
      </section>

      {/* 8. Career Roadmap */}
      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Career Roadmap" title="From beginner to enterprise security architect" />
          <div className="mt-12 grid gap-4 md:grid-cols-4 lg:grid-cols-7">
            {[
              { s: "Beginner", i: Rocket },
              { s: "Security+", i: Shield },
              { s: "SOC Analyst", i: Activity },
              { s: "Cloud Security", i: Cloud },
              { s: "AI Security", i: BrainCircuit },
              { s: "CISSP", i: Award },
              { s: "Enterprise Security", i: Trophy },
            ].map((step, idx) => (
              <div key={step.s} className="relative flex flex-col items-center gap-3 rounded-xl bg-surface p-5 ring-1 ring-hairline">
                <div className="grid size-10 place-items-center rounded-full bg-brand/15 ring-1 ring-brand/30">
                  <step.i className="size-4 text-brand" />
                </div>
                <span className="text-center text-xs font-medium text-foreground">{step.s}</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Step {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Founder, Mentor & Lead Instructor (one person) */}
      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-brand">Founder · Mentor &amp; Lead Instructor</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{mentor.name}</h2>
              <p className="mt-1 text-sm font-medium text-brand">{mentor.headline}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{mentor.bio}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Founder, mentor and lead instructor are one and the same here — {mentor.name} authors and
                teaches every core course, certification track, and lab on the platform, bridging traditional
                cybersecurity practice with the reality of AI-augmented threats.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {mentor.stats.map((s) => (
                  <div key={s.k} className="rounded-xl bg-background p-4 ring-1 ring-hairline">
                    <div className="text-2xl font-semibold text-foreground">{s.k}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="mt-6 inline-flex rounded-md bg-surface px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-hairline hover:bg-surface-2">
                Read the full story
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-hairline">
              <img src={mentor.photo_url} alt={mentor.name} className="aspect-[4/5] w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* 11. Student Dashboard Preview */}
      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Student Dashboard" title="Track every lesson, project and certification" />
          <div className="mt-10 rounded-2xl bg-surface p-6 ring-1 ring-hairline lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4 sm:grid-cols-3">
                <DashCard icon={Zap} label="XP" value="4,820" />
                <DashCard icon={TrendingUp} label="Streak" value="18 days" />
                <DashCard icon={Award} label="Certificates" value="3" />
                <DashCard icon={BookOpen} label="Courses in progress" value="4" />
                <DashCard icon={GraduationCap} label="Completed" value="7" />
                <DashCard icon={Calendar} label="Upcoming" value="2 today" />
              </div>
              <div className="rounded-xl bg-background/60 p-6 ring-1 ring-hairline">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overall progress</div>
                <div className="mt-4 flex items-center gap-6">
                  <div className="relative grid size-24 place-items-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--hairline))" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--brand))" strokeWidth="3" strokeDasharray="82 100" strokeLinecap="round" />
                    </svg>
                    <span className="text-lg font-semibold text-foreground">82%</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <ProgressLine label="Cybersecurity Fundamentals" pct={95} />
                    <ProgressLine label="Network Security" pct={70} />
                    <ProgressLine label="Cloud Security" pct={40} />
                    <ProgressLine label="AI Security" pct={10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Learning Analytics */}
      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Learning Analytics" title="See exactly where you are in your journey" />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weekly study hours</div>
              <div className="mt-6 flex h-32 items-end gap-2">
                {[3, 5, 4, 7, 6, 8, 5].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-brand/70" style={{ height: `${h * 12}%` }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                {["M","T","W","T","F","S","S"].map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
            <div className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Achievements</div>
              <div className="mt-6 grid grid-cols-4 gap-3">
                {[Award, Trophy, Shield, Zap, BadgeCheck, GraduationCap, Star, Rocket].map((I, i) => (
                  <div key={i} className="grid aspect-square place-items-center rounded-lg bg-brand/10 ring-1 ring-brand/30">
                    <I className="size-5 text-brand" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-surface p-6 ring-1 ring-hairline">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">This month</div>
              <div className="mt-6 space-y-4">
                <StatRow label="Total XP" value="4,820" />
                <StatRow label="Learning time" value="26h 40m" />
                <StatRow label="Lessons complete" value="42" />
                <StatRow label="Daily streak" value="18 days" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Community */}
      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Community" title="Join a global cybersecurity community" description="Practitioner-only channels for SOC, cloud, AI, certifications, and jobs." />
          <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { c: "#cybersecurity", i: Shield },
              { c: "#ai-security", i: BrainCircuit },
              { c: "#cloud", i: Cloud },
              { c: "#soc", i: Activity },
              { c: "#certifications", i: Award },
              { c: "#jobs", i: Briefcase },
            ].map((ch) => (
              <div key={ch.c} className="flex items-center gap-3 rounded-xl bg-surface p-4 ring-1 ring-hairline">
                <ch.i className="size-4 text-brand" />
                <span className="text-sm font-medium text-foreground">{ch.c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. Student Success Stories (placeholder careers) */}
      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Where Our Students Go" title="Careers you can build here" description="Full learning paths mapped to real roles hiring right now." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "SOC Analyst",
              "Security Engineer",
              "Cloud Security Engineer",
              "Penetration Tester",
              "AI Security Engineer",
              "GRC Consultant",
              "Digital Forensics",
              "Security Architect",
            ].map((r) => (
              <div key={r} className="rounded-xl bg-surface p-5 ring-1 ring-hairline">
                <Briefcase className="size-5 text-brand" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">{r}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Guided learning path · Certification prep · Interview coaching</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. FAQ */}
      <FAQ />

      {/* 16. Newsletter */}
      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <MessagesSquare className="mx-auto size-6 text-brand" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Weekly threat briefings, straight to your inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">Curated intel on breaches, new CVEs, and AI-security research — free.</p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="you@company.com" className="flex-1 rounded-md bg-background px-4 py-2.5 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
            <button type="submit" className="rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand">Subscribe</button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-bold tracking-widest uppercase text-brand">{eyebrow}</span>
      <h2 className="max-w-[40ch] text-balance text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description ? <p className="max-w-[60ch] text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 ring-1 ring-brand/25">
      <BadgeCheck className="size-3 text-brand" />
    </span>
  );
}

function DashCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/60 p-5 ring-1 ring-hairline">
      <Icon className="size-4 text-brand" />
      <div className="mt-3 text-lg font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgressLine({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-hairline">
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function FAQ() {
  const items = [
    { q: "Is the masterclass really free?", a: "Yes — 100% free. Create an account, reserve your seat, and watch on demand. No credit card." },
    { q: "Do certifications come with the paid plans?", a: "The Career plan includes one learning path. Professional unlocks every certification prep track and exam simulator." },
    { q: "Do I need experience to start?", a: "No. Start with the Cybersecurity Career Masterclass and the free Fundamentals course, then follow the guided roadmap." },
    { q: "Are the labs real?", a: "Yes. Virtual security labs use the same tools your future SOC will — Splunk, Wireshark, Burp, cloud consoles, and more." },
    { q: "Can I get a refund?", a: "Every paid plan is monthly and cancellable anytime. Enterprise plans include a pilot period." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="border-t border-hairline py-24">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader eyebrow="FAQ" title="Answers to what people ask most" />
        <div className="mt-10 divide-y divide-hairline rounded-xl bg-surface ring-1 ring-hairline">
          {items.map((it, i) => (
            <button key={it.q} onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{it.q}</div>
                {open === i ? <p className="mt-2 text-sm text-muted-foreground">{it.a}</p> : null}
              </div>
              <ChevronRight className={`size-4 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-90 text-brand" : ""}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}