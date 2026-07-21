import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — AI Security Hub" },
      { name: "description", content: "Research notes, retrospectives, and study guides from the AI Security Hub practitioners." },
      { property: "og:title", content: "Blog — AI Security Hub" },
      { property: "og:description", content: "Research notes and study guides for security practitioners." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () =>
      (
        await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, category, published_at")
          .eq("published", true)
          .order("published_at", { ascending: false })
      ).data ?? [],
  });

  return (
    <PageShell>
      <PageHeader eyebrow="Signal" title="Research notes from the practitioners." description="Retrospectives, threat analysis, and honest study guides." />
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.id}
              to="/blog_/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col rounded-xl bg-surface p-8 ring-1 ring-hairline transition-colors hover:ring-brand/40"
            >
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase">
                <span className="text-brand">{p.category}</span>
                <span className="text-muted-foreground">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
              <span className="mt-6 text-sm font-medium text-brand">Read article →</span>
            </Link>
          ))}
          {posts.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">No articles yet — check back soon.</p>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}