import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MentorStat = { k: string; v: string };
export type Mentor = {
  photo_url: string;
  name: string;
  headline: string;
  bio: string;
  stats: MentorStat[];
};

export const DEFAULT_MENTOR: Mentor = {
  photo_url: "/__l5e/assets-v1/5beb65f4-fb8f-4df3-8692-cb20c0c4288f/mentor.jpg",
  name: "Our Mentor",
  headline: "25+ years cybersecurity consulting",
  bio: "Our mentor is a veteran cybersecurity consultant with more than two and a half decades of experience.",
  stats: [
    { k: "25+", v: "Years experience" },
    { k: "500+", v: "Practitioners mentored" },
    { k: "40+", v: "Enterprise engagements" },
  ],
};

export function useMentor(): Mentor {
  const { data } = useQuery({
    queryKey: ["site_content", "mentor"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", "mentor").maybeSingle();
      return (data?.value ?? null) as Partial<Mentor> | null;
    },
  });
  return { ...DEFAULT_MENTOR, ...(data ?? {}), stats: data?.stats ?? DEFAULT_MENTOR.stats };
}