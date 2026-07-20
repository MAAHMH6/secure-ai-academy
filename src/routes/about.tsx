import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AI Security Hub" },
      { name: "description", content: "AI Security Hub trains the next generation of cybersecurity practitioners for the age of autonomous threats." },
      { property: "og:title", content: "About — AI Security Hub" },
      { property: "og:description", content: "Our mission, values, and team." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="About" title="Rigorous training for the age of autonomous threats." description="We build the standard curriculum for the practitioners defending the AI-powered economy." />
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              AI Security Hub exists to close the widening gap between the pace of threat evolution
              and the depth of practitioner training. From SOC operations to adversarial ML, our
              curriculum is designed by principal security engineers and continuously updated as
              the threat landscape shifts.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">What we stand for</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li><span className="text-foreground">Depth over breadth.</span> We ship courses only when they hold up in a real SOC.</li>
              <li><span className="text-foreground">Lab-first.</span> Every technical concept is anchored by a hands-on exercise.</li>
              <li><span className="text-foreground">Practitioner authored.</span> Our instructors ship security software in production.</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-20 grid max-w-7xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {[
            { k: "50k+", v: "Practitioners trained" },
            { k: "140+", v: "Courses & labs" },
            { k: "8", v: "Certification tracks" },
            { k: "24", v: "Knowledge domains" },
          ].map((s) => (
            <div key={s.v} className="rounded-xl border border-hairline bg-surface p-6">
              <div className="text-3xl font-semibold text-foreground">{s.k}</div>
              <div className="mt-1 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}