import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AI Security Hub" },
      { name: "description", content: "How AI Security Hub collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Legal" title="Privacy Policy" description="Last updated July 2026." />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground font-medium">Information we collect.</span> Account details (name, email), learning progress, and payment metadata processed through our PCI-DSS compliant payment providers.</p>
          <p className="mt-4"><span className="text-foreground font-medium">How we use it.</span> To deliver courses, issue certificates, personalize recommendations, and communicate service updates.</p>
          <p className="mt-4"><span className="text-foreground font-medium">Sharing.</span> We never sell personal data. Limited data is shared with sub-processors (hosting, analytics, email) under strict DPAs.</p>
          <p className="mt-4"><span className="text-foreground font-medium">Cookies.</span> Essential cookies power authentication and session state. Analytics cookies are optional and can be disabled in your browser.</p>
          <p className="mt-4"><span className="text-foreground font-medium">Your rights.</span> Under GDPR/UK-GDPR you may request access, correction, deletion, or portability of your data.</p>
          <p className="mt-4"><span className="text-foreground font-medium">Retention.</span> Data is retained while your account is active and for up to 24 months after closure for legal and audit obligations.</p>
          <p className="mt-4"><span className="text-foreground font-medium">Contact.</span> Data protection queries — privacy@aisecurityhub.com.</p>
        </div>
      </section>
    </PageShell>
  );
}