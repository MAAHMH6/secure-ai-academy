import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Individual",
    price: 29,
    description: "For self-directed learners building foundational skills.",
    features: ["Access to 40+ foundational courses", "Community forums", "Course certificates", "Cancel anytime"],
    highlighted: false,
  },
  {
    name: "Professional",
    price: 79,
    description: "For working practitioners and certification candidates.",
    features: ["Everything in Individual", "All 140+ courses & cert tracks", "Hands-on virtual labs", "Exam prep simulators", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "For security teams, SOCs, and compliance-driven organizations.",
    features: ["SSO, SCIM, audit logs", "Custom learning paths", "Dedicated success manager", "Team analytics", "Volume licensing"],
    highlighted: false,
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
                  Most Popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                {t.price !== null ? (
                  <>
                    <span className="text-4xl font-semibold text-foreground">${t.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-foreground">Custom</span>
                )}
              </div>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-foreground/90">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to={t.name === "Enterprise" ? "/contact" : "/auth"}
                search={t.name !== "Enterprise" ? { mode: "register" } : undefined}
                className={`mt-8 rounded-md px-4 py-2.5 text-center text-sm font-medium ring-1 transition-colors ${
                  t.highlighted
                    ? "bg-brand text-brand-foreground ring-brand"
                    : "bg-background text-foreground ring-hairline hover:bg-surface-2"
                }`}
              >
                {t.name === "Enterprise" ? "Contact sales" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}