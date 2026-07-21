import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { z } from "zod";
import { Mail, Phone, MapPin, MessageSquare, Building2, Clock } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(2000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AI Security Hub" },
      { name: "description", content: "Contact the AI Security Hub team about training, certifications, or enterprise programs." },
      { property: "og:title", content: "Contact — AI Security Hub" },
      { property: "og:description", content: "Get in touch about training or enterprise programs." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [status, setStatus] = useState<null | "ok" | "err">(null);
  const [error, setError] = useState<string>("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parse = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      company: fd.get("company") || undefined,
      message: fd.get("message"),
    });
    if (!parse.success) {
      setStatus("err");
      setError(parse.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    // Placeholder: wire to email/CRM later.
    setStatus("ok");
    setError("");
    e.currentTarget.reset();
  }

  const contactCards = [
    { icon: Mail, label: "Enterprise Sales", value: "enterprise@aisecurityhub.com", href: "mailto:enterprise@aisecurityhub.com" },
    { icon: MessageSquare, label: "Learner Support", value: "support@aisecurityhub.com", href: "mailto:support@aisecurityhub.com" },
    { icon: Phone, label: "Phone (UK · 24/5)", value: "+44 (0) 20 8156 0000", href: "tel:+442081560000" },
    { icon: MapPin, label: "Headquarters", value: "1 Finsbury Ave, London EC2M 2PF, UK", href: "#" },
    { icon: Building2, label: "Regional Offices", value: "Dubai · Singapore · New York", href: "#" },
    { icon: Clock, label: "Response SLA", value: "< 1 business day", href: "#" },
  ];
  const inquiryTypes = ["General question", "Enterprise / Team plan", "Certification track", "Partnership", "Media / Press"];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Contact"
        title="Talk to our team."
        description="Enterprise programs, custom curriculum, certification advice, or general questions — a real practitioner responds to every message."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Left — contact details */}
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {contactCards.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="group flex items-start gap-3 rounded-xl bg-surface p-5 ring-1 ring-hairline transition-colors hover:ring-brand/40"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand/10 ring-1 ring-brand/20">
                      <c.icon className="size-4 text-brand" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{c.label}</div>
                      <div className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-brand">{c.value}</div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="rounded-xl border border-hairline bg-gradient-to-b from-surface to-background p-6">
                <div className="text-[10px] font-bold tracking-widest uppercase text-brand">Enterprise programs</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Custom curriculum design, SOC upskilling, red-team engagements, and compliance-aligned
                  training for regulated industries. Volume licensing available from 25 seats.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-5 rounded-2xl bg-surface p-8 ring-1 ring-hairline"
            >
              <div>
                <h2 className="text-lg font-semibold text-foreground">Send us a message</h2>
                <p className="mt-1 text-xs text-muted-foreground">All fields marked * are required.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name *" name="name" required placeholder="Jane Doe" />
                <Field label="Work email *" name="email" type="email" required placeholder="jane@company.com" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company" name="company" placeholder="Acme Inc." />
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Inquiry type</label>
                  <select
                    name="inquiry"
                    className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
                    defaultValue={inquiryTypes[0]}
                  >
                    {inquiryTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Message *</label>
                <textarea
                  name="message"
                  rows={6}
                  required
                  placeholder="Tell us about your team size, goals, or the certifications you're targeting…"
                  className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" required className="mt-0.5 accent-[color:var(--brand)]" />
                <span>I agree to be contacted about my inquiry and have read the <a href="/privacy" className="text-brand hover:underline">privacy policy</a>.</span>
              </label>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-muted-foreground">We reply within one business day.</p>
                <button
                  type="submit"
                  className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand transition-transform active:scale-95"
                >
                  Send message
                </button>
              </div>
              {status === "ok" ? (
                <p className="rounded-md bg-brand/10 px-3 py-2 text-xs font-medium text-brand ring-1 ring-brand/30">
                  Thanks — we&apos;ll be in touch shortly.
                </p>
              ) : null}
              {status === "err" ? (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive ring-1 ring-destructive/30">
                  {error}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, name, type = "text", required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
      />
    </div>
  );
}