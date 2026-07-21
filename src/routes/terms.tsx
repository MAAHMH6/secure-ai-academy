import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AI Security Hub" },
      { name: "description", content: "Terms of Service for AI Security Hub — training programs, subscriptions, certifications, and enterprise plans." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Legal" title="Terms of Service" description="Last updated July 2026." />
      <section className="py-16">
        <div className="prose prose-invert mx-auto max-w-3xl px-6 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground font-medium">1. Acceptance of Terms.</span> By accessing AI Security Hub you agree to these Terms of Service and all applicable laws.</p>
          <p className="mt-4"><span className="text-foreground font-medium">2. Accounts.</span> You are responsible for maintaining the confidentiality of your credentials and for all activity on your account.</p>
          <p className="mt-4"><span className="text-foreground font-medium">3. Subscriptions & Payments.</span> Paid plans renew automatically until cancelled. Refunds are handled per our published policy.</p>
          <p className="mt-4"><span className="text-foreground font-medium">4. Course Content.</span> All curriculum, labs, and materials are the intellectual property of AI Security Hub and licensed for personal educational use only.</p>
          <p className="mt-4"><span className="text-foreground font-medium">5. Certificates.</span> Certificates of completion are issued upon meeting the published passing criteria. They are not affiliated with third-party credentialing bodies unless explicitly stated.</p>
          <p className="mt-4"><span className="text-foreground font-medium">6. Acceptable Use.</span> You may not use lab environments to attack systems you do not own or have written authorization to test.</p>
          <p className="mt-4"><span className="text-foreground font-medium">7. Limitation of Liability.</span> Services are provided "as-is" without warranty of any kind. Liability is capped at fees paid in the preceding twelve months.</p>
          <p className="mt-4"><span className="text-foreground font-medium">8. Contact.</span> Questions about these terms — legal@aisecurityhub.com.</p>
        </div>
      </section>
    </PageShell>
  );
}