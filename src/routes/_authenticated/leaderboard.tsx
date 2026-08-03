import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { Flame, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — AI Security Hub" },
      { name: "description", content: "See the top learners on AI Security Hub ranked by XP, streaks, and badges earned." },
      { property: "og:title", content: "Leaderboard — AI Security Hub" },
      { property: "og:description", content: "Top learners ranked by XP, streaks, and badges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

type Row = {
  user_id: string;
  points: number;
  level: number;
  name: string;
  avatar: string | null;
  streak: number;
  badges: number;
};

function LeaderboardPage() {
  const { user } = useAuth();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<Row[]> => {
      const [{ data: xp }, { data: streaks }, { data: profiles }, { data: badges }] = await Promise.all([
        supabase.from("user_xp").select("user_id, points, level").order("points", { ascending: false }).limit(50),
        supabase.from("user_streaks").select("user_id, current_streak"),
        supabase.from("profiles").select("id, full_name, avatar_url"),
        supabase.from("user_badges").select("user_id"),
      ]);
      const streakBy = new Map((streaks ?? []).map((s) => [s.user_id, s.current_streak]));
      const profileBy = new Map((profiles ?? []).map((p) => [p.id, p]));
      const badgeCount = new Map<string, number>();
      for (const b of badges ?? []) badgeCount.set(b.user_id, (badgeCount.get(b.user_id) ?? 0) + 1);
      return (xp ?? []).map((x) => ({
        user_id: x.user_id,
        points: x.points,
        level: x.level,
        name: profileBy.get(x.user_id)?.full_name ?? "Learner",
        avatar: profileBy.get(x.user_id)?.avatar_url ?? null,
        streak: streakBy.get(x.user_id) ?? 0,
        badges: badgeCount.get(x.user_id) ?? 0,
      }));
    },
  });

  const medal = ["text-amber-400", "text-zinc-300", "text-amber-700"];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Community"
        title="Leaderboard"
        description="Top learners ranked by XP earned from completed lessons, streaks, and badges."
      />
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-6 flex gap-2 text-xs">
            <Link to="/community" className="rounded-full bg-surface px-3 py-1.5 text-muted-foreground ring-1 ring-hairline hover:text-foreground">
              Community channels
            </Link>
            <Link to="/dashboard" className="rounded-full bg-surface px-3 py-1.5 text-muted-foreground ring-1 ring-hairline hover:text-foreground">
              My dashboard
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-2xl bg-surface p-10 text-center text-sm text-muted-foreground ring-1 ring-hairline">Loading rankings…</div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl bg-surface p-10 text-center ring-1 ring-hairline">
              <Trophy className="mx-auto size-8 text-brand/60" />
              <p className="mt-3 text-sm text-foreground">No XP earned yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Complete your first lesson to claim the top spot.</p>
              <Link to="/courses" className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground">Browse courses</Link>
            </div>
          ) : (
            <ul className="divide-y divide-hairline overflow-hidden rounded-2xl bg-surface ring-1 ring-hairline">
              {rows.map((r, i) => (
                <li
                  key={r.user_id}
                  className={`flex items-center gap-4 px-5 py-4 ${r.user_id === user?.id ? "bg-brand/5" : ""}`}
                >
                  <span className={`w-8 text-center text-sm font-semibold ${medal[i] ?? "text-muted-foreground"}`}>{i + 1}</span>
                  <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-background text-xs font-semibold text-muted-foreground ring-1 ring-hairline">
                    {r.avatar ? <img src={r.avatar} alt={r.name} className="size-full object-cover" /> : r.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {r.name}
                      {r.user_id === user?.id ? <span className="ml-2 text-[10px] font-bold uppercase text-brand">You</span> : null}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Level {r.level} · {r.badges} badge{r.badges === 1 ? "" : "s"}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Flame className="size-3.5 text-brand" />{r.streak}d</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"><Zap className="size-3.5 text-brand" />{r.points.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}
