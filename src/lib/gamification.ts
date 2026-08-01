import { supabase } from "@/integrations/supabase/client";

export const XP_PER_LESSON = 25;

export function levelFor(points: number) {
  return Math.max(1, Math.floor(points / 500) + 1);
}

export function levelProgress(points: number) {
  const into = points % 500;
  return { into, needed: 500, percent: Math.round((into / 500) * 100) };
}

export async function awardXp(userId: string, points: number) {
  const { data } = await supabase.from("user_xp").select("*").eq("user_id", userId).maybeSingle();
  if (!data) {
    await supabase.from("user_xp").insert({
      user_id: userId,
      points,
      lifetime_points: points,
      level: levelFor(points),
    });
    return;
  }
  const next = data.points + points;
  await supabase
    .from("user_xp")
    .update({ points: next, lifetime_points: data.lifetime_points + points, level: levelFor(next) })
    .eq("user_id", userId);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function touchStreak(userId: string) {
  const d = today();
  const { data } = await supabase.from("user_streaks").select("*").eq("user_id", userId).maybeSingle();
  if (!data) {
    await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: d,
    });
    return;
  }
  if (data.last_active_date === d) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const current = data.last_active_date === yesterday ? data.current_streak + 1 : 1;
  await supabase
    .from("user_streaks")
    .update({
      current_streak: current,
      longest_streak: Math.max(current, data.longest_streak),
      last_active_date: d,
    })
    .eq("user_id", userId);
}

export async function grantAchievement(userId: string, code: string) {
  const { data: ach } = await supabase
    .from("achievements")
    .select("id, xp_reward")
    .eq("code", code)
    .maybeSingle();
  if (!ach) return;
  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("achievement_id", ach.id)
    .maybeSingle();
  if (existing) return;
  await supabase.from("user_badges").insert({ user_id: userId, achievement_id: ach.id });
  if (ach.xp_reward) await awardXp(userId, ach.xp_reward);
}

/** Called after a lesson is marked complete. Handles XP, streak and milestone badges. */
export async function onLessonCompleted(userId: string, totalCompleted: number, courseFinished: boolean, isMasterclass: boolean) {
  await awardXp(userId, XP_PER_LESSON);
  await touchStreak(userId);
  if (totalCompleted >= 1) await grantAchievement(userId, "first_lesson");
  if (totalCompleted >= 5) await grantAchievement(userId, "five_lessons");
  if (courseFinished) await grantAchievement(userId, "first_course");
  if (courseFinished && isMasterclass) await grantAchievement(userId, "masterclass");
  const { data: streak } = await supabase
    .from("user_streaks")
    .select("current_streak")
    .eq("user_id", userId)
    .maybeSingle();
  if ((streak?.current_streak ?? 0) >= 7) await grantAchievement(userId, "streak_7");
}