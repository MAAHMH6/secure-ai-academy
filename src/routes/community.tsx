import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Brain, Briefcase, Cloud, Megaphone, Radar, Users, MessageSquare, Trophy, Lock } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — AI Security Hub" },
      { name: "description", content: "Join AI Security Hub community channels for SOC analysts, cloud security, AI security, career help, and certification study groups." },
      { property: "og:title", content: "Community — AI Security Hub" },
      { property: "og:description", content: "Channels for SOC, cloud, AI security, careers, and certification study groups." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

const ICONS: Record<string, typeof Users> = {
  megaphone: Megaphone,
  radar: Radar,
  cloud: Cloud,
  brain: Brain,
  briefcase: Briefcase,
  users: Users,
};

function CommunityPage() {
  const { data: channels = [] } = useQuery({
    queryKey: ["community_channels"],
    queryFn: async () =>
      (await supabase.from("community_channels").select("*").order("sort_order")).data ?? [],
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Community"
        title="Learn alongside practitioners, not alone"
        description="Channels for every discipline we teach. Discussion threads open in stages — channels below are live previews of what each space covers."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-wrap gap-2 text-xs">
            <Link to="/leaderboard" className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-muted-foreground ring-1 ring-hairline hover:text-foreground">
              <Trophy className="size-3.5 text-brand" /> Leaderboard
            </Link>
            <Link to="/courses" className="rounded-full bg-surface px-3 py-1.5 text-muted-foreground ring-1 ring-hairline hover:text-foreground">
              Browse courses
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((c) => {
              const Icon = ICONS[c.icon ?? "users"] ?? Users;
              return (
                <article key={c.id} className="rounded-2xl bg-surface p-6 ring-1 ring-hairline">
                  <div className="flex items-start justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
                      <Icon className="size-4.5 text-brand" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-hairline">
                      <Lock className="size-3" /> Read-only
                    </span>
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-foreground">#{c.slug}</h2>
                  <p className="mt-0.5 text-xs font-medium text-brand">{c.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MessageSquare className="size-3.5" /> Threads open soon
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-hairline bg-gradient-to-b from-surface to-background p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground">Want to be first in when discussions go live?</h2>
            <p className="mx-auto mt-2 max-w-[60ch] text-sm text-muted-foreground">
              Reserve your seat in the free Cybersecurity Career Masterclass — attendees get early access to every community channel.
            </p>
            <Link
              to="/courses/$slug"
              params={{ slug: "cybersecurity-career-masterclass" }}
              className="mt-6 inline-flex rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand"
            >
              Reserve free seat
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}