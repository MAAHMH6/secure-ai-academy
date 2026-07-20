import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { z } from "zod";

const searchSchema = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/courses")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Courses — AI Security Hub" },
      { name: "description", content: "Browse 140+ hands-on cybersecurity, cloud, and AI security courses across 24 specialized knowledge domains." },
      { property: "og:title", content: "Courses — AI Security Hub" },
      { property: "og:description", content: "Cybersecurity, cloud, and AI security courses across 24 domains." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { category } = Route.useSearch();
  const [filter, setFilter] = useState<string | undefined>(category);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["courses", filter],
    queryFn: async () => {
      let q = supabase.from("courses").select("id, slug, title, subtitle, price_cents, lesson_count, level, is_certification, category_id").eq("published", true);
      if (filter) {
        const cat = categories.find((c) => c.slug === filter);
        if (cat) q = q.eq("category_id", cat.id);
      }
      return (await q).data ?? [];
    },
    enabled: !filter || categories.length > 0,
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="140+ Courses"
        title="Course Catalog"
        description="Hands-on curriculums from foundational security to advanced AI red-teaming."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(undefined)}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
                !filter ? "bg-brand text-brand-foreground ring-brand" : "bg-surface text-muted-foreground ring-hairline hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.slug)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
                  filter === c.slug
                    ? "bg-brand text-brand-foreground ring-brand"
                    : "bg-surface text-muted-foreground ring-hairline hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
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
                    <span className="text-[10px] font-medium text-muted-foreground">{c.lesson_count} Lessons</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                  <p className="text-pretty text-sm text-muted-foreground">{c.subtitle}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4">
                    <span className="text-sm font-semibold text-foreground">${(c.price_cents / 100).toFixed(2)}</span>
                    <Link to="/auth" search={{ mode: "register" }} className="text-sm font-medium text-brand hover:text-brand/80">
                      Enroll →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {courses.length === 0 ? (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                No courses match this filter yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}