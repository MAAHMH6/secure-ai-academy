import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Check, Package, Award } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    price: 0,
    cadence: "forever",
    description: "Start exploring cybersecurity fundamentals at zero risk.",
    features: [
      "Access to 5 foundational courses",
      "2 certification prep tracks",
      "Community forums",
      "Basic progress tracking",
      "No credit card required",
    ],
    highlighted: false,
    cta: "Create free account",
  },
  {
    name: "Individual",
    price: 49,
    cadence: "/month",
    description: "For self-directed learners actively building a security career.",
    features: [
      "20 hands-on courses",
      "10 certification prep tracks",
      "Downloadable resources & cheat sheets",
      "Verified course certificates",
      "Standard email support",
      "Cancel anytime",
    ],
    highlighted: false,
    cta: "Start Individual",
  },
  {
    name: "Professional",
    price: 129,
    cadence: "/month",
    description: "For working practitioners and certification candidates.",
    features: [
      "All 140+ courses & every cert track",
      "Full hands-on virtual lab environment",
      "Exam prep simulators & practice tests",
      "AI Tutor & 1:1 mentor Q&A sessions",
      "Priority support · 24h response",
      "Team-shareable learning analytics",
    ],
    highlighted: true,
    cta: "Go Professional",
  },
];

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AI Security Hub" },
      { name: "description", content: "Individual, Professional, and Enterprise plans for cybersecurity training and certification prep." },
      { property: "og:title", content: "Pricing — AI Security Hub" },
      { property: "og:description", content: "Flexible plans for individuals and teams." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Pricing" title="Plans built for practitioners and teams" description="Start free. Upgrade when your career or SOC needs it." />
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-2xl p-8 ring-1 ${
                t.highlighted ? "bg-surface ring-brand/50 shadow-[0_0_60px_-20px_var(--brand)]" : "bg-surface ring-hairline"
              }`}
            >
              {t.highlighted ? (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-brand/15 px-3 py-1 text-[10px] font-bold tracking-wider text-brand uppercase ring-1 ring-brand/30">
                  Recommended
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-foreground">${t.price}</span>
                <span className="text-sm text-muted-foreground">{t.cadence}</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-foreground/90">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className={`mt-8 rounded-md px-4 py-2.5 text-center text-sm font-medium ring-1 transition-colors ${
                  t.highlighted
                    ? "bg-brand text-brand-foreground ring-brand"
                    : "bg-background text-foreground ring-hairline hover:bg-surface-2"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-4xl px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need SSO, SCIM, custom learning paths, or volume licensing for your SOC?{" "}
            <Link to="/contact" className="font-medium text-brand hover:underline">
              Talk to our enterprise team →
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-hairline bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-brand">Certification Packs</span>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Buy the credential path, not one exam.</h2>
            <p className="max-w-[60ch] text-sm text-muted-foreground">
              Every certification is paid — but bundled tracks unlock deep discounts, shared lab time, and a single
              guided study plan across multiple credentials.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { name: "Cyber Essentials Pack", price: 599, tracks: ["Security+", "CEH", "CISM Foundations"], description: "Perfect for analysts stepping into their first blue-team or governance role." },
              { name: "Cloud Defender Pack", price: 749, tracks: ["AWS Security", "Azure Security", "CCSP Prep"], description: "Full cloud-security stack — the fastest path to a senior cloud role." },
              { name: "Elite Practitioner Pack", price: 1249, tracks: ["CISSP", "CISM", "CISA", "GRC & ISO 27001"], description: "Our flagship bundle for principal engineers, CISOs, and consultants.", highlighted: true },
            ].map((p) => (
              <div key={p.name} className={`flex flex-col rounded-2xl p-8 ring-1 ${p.highlighted ? "bg-surface ring-brand/50 shadow-[0_0_60px_-20px_var(--brand)]" : "bg-surface ring-hairline"}`}>
                {p.highlighted ? (
                  <span className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-brand/15 px-3 py-1 text-[10px] font-bold tracking-wider text-brand uppercase ring-1 ring-brand/30">
                    <Award className="size-3" /> Recommended
                  </span>
                ) : (
                  <Package className="mb-3 size-5 text-brand" />
                )}
                <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-foreground">${p.price}</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
                <ul className="mt-6 flex flex-col gap-3 text-sm text-foreground/90">
                  {p.tracks.map((t) => (
                    <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand" /> {t}</li>
                  ))}
                </ul>
                <Link to="/auth" search={{ mode: "register" }} className={`mt-8 rounded-md px-4 py-2.5 text-center text-sm font-medium ring-1 ${p.highlighted ? "bg-brand text-brand-foreground ring-brand" : "bg-background text-foreground ring-hairline hover:bg-surface-2"}`}>
                  Get this pack
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="text-[10px] font-bold tracking-widest uppercase text-brand">Free Masterclass</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            The Cybersecurity Career Masterclass — 100% Free.
          </h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            A hand-crafted masterclass covering global cyber demand, real career paths, the beginner&apos;s roadmap,
            and how AI is reshaping the industry. Built to help thousands break into cybersecurity — no cost, no catch.
          </p>
          <Link to="/auth" search={{ mode: "register" }} className="mt-6 inline-flex rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand">
            Reserve my free seat
          </Link>
        </div>
      </section>
    </PageShell>
  );
}