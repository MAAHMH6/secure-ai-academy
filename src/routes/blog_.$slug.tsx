import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog_/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — AI Security Hub Blog` },
      { name: "description", content: "Research notes and study guides from AI Security Hub practitioners." },
    ],
  }),
  component: BlogPostPage,
  errorComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-muted-foreground">
        Failed to load this article. <Link to="/blog" className="text-brand">Back to blog</Link>.
      </div>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-muted-foreground">
        Article not found. <Link to="/blog" className="text-brand">Back to blog</Link>.
      </div>
    </PageShell>
  ),
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (!data) throw notFound();
      return data;
    },
  });

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-6 py-20">
        <Link to="/blog" className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
          <ArrowLeft className="size-3" /> All articles
        </Link>
        {isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
        ) : post ? (
          <>
            <div className="mt-6 flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase">
              <span className="text-brand">{post.category}</span>
              <span className="text-muted-foreground">
                {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : ""}
              </span>
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">{post.title}</h1>
            {post.excerpt ? <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p> : null}
            <div className="mt-10 border-t border-hairline pt-10 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {post.content}
            </div>
          </>
        ) : null}
      </article>
    </PageShell>
  );
}