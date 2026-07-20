import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { z } from "zod";

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

  return (
    <PageShell>
      <PageHeader eyebrow="Contact" title="Talk to our team." description="Enterprise programs, custom curriculum, or general questions — we read every message." />
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="text-sm text-muted-foreground">
            <p><span className="text-foreground">Enterprise:</span> enterprise@aisecurityhub.com</p>
            <p className="mt-2"><span className="text-foreground">Support:</span> support@aisecurityhub.com</p>
            <p className="mt-6">Typical response time: within 1 business day.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-surface p-6 ring-1 ring-hairline">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" name="name" required />
              <Field label="Work email" name="email" type="email" required />
            </div>
            <Field label="Company (optional)" name="company" />
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand"
            >
              Send message
            </button>
            {status === "ok" ? <p className="text-xs text-brand">Thanks — we&apos;ll be in touch shortly.</p> : null}
            {status === "err" ? <p className="text-xs text-destructive">{error}</p> : null}
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand"
      />
    </div>
  );
}