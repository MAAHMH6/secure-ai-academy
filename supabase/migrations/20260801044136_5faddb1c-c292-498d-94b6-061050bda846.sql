-- 1. course kind
DO $$ BEGIN
  CREATE TYPE public.course_kind AS ENUM ('course','certification','masterclass');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS kind public.course_kind NOT NULL DEFAULT 'course';
UPDATE public.courses SET kind = 'certification' WHERE is_certification = true;

-- 2. profiles CRM fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lead_source text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS interested_domain text,
  ADD COLUMN IF NOT EXISTS current_role_title text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- 3. masterclass_registrations
CREATE TABLE IF NOT EXISTS public.masterclass_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country_code text,
  country text,
  experience_level text,
  interested_domain text,
  current_role_title text,
  heard_from text,
  goals text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.masterclass_registrations TO authenticated;
GRANT ALL ON public.masterclass_registrations TO service_role;
ALTER TABLE public.masterclass_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own registrations" ON public.masterclass_registrations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_mc_reg_updated BEFORE UPDATE ON public.masterclass_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. lesson_resources
CREATE TABLE IF NOT EXISTS public.lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  kind text NOT NULL DEFAULT 'link',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_resources TO authenticated;
GRANT ALL ON public.lesson_resources TO service_role;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resources public if course published" ON public.lesson_resources
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = lesson_resources.lesson_id AND c.published = true));
CREATE POLICY "Admins/instructors manage resources" ON public.lesson_resources
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = lesson_resources.lesson_id AND c.instructor_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = lesson_resources.lesson_id AND c.instructor_id = auth.uid()));

-- 5. achievements catalog
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  icon text,
  xp_reward integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are public" ON public.achievements FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 6. user_badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own badges" ON public.user_badges FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- 7. user_xp
CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_xp TO authenticated;
GRANT ALL ON public.user_xp TO service_role;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own xp" ON public.user_xp FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_user_xp_updated BEFORE UPDATE ON public.user_xp
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. user_streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_streaks TO service_role;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streaks" ON public.user_streaks FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_user_streaks_updated BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. seed achievements
INSERT INTO public.achievements (code, title, description, icon, xp_reward, sort_order) VALUES
  ('first_lesson','First Steps','Complete your first lesson','Footprints',50,1),
  ('five_lessons','Momentum','Complete five lessons','Flame',100,2),
  ('first_course','Course Finisher','Complete your first course','GraduationCap',250,3),
  ('streak_7','Seven Day Streak','Learn seven days in a row','CalendarCheck',150,4),
  ('first_cert','Certified','Earn your first certificate','Award',500,5),
  ('masterclass','Masterclass Graduate','Finish the free career masterclass','Sparkles',200,6)
ON CONFLICT (code) DO NOTHING;

-- 10. seed masterclass
INSERT INTO public.courses (slug, title, subtitle, description, level, price_cents, duration_minutes, lesson_count, is_certification, kind, published)
VALUES (
  'cybersecurity-career-masterclass',
  'Free Cybersecurity Career Masterclass',
  'A 60-minute recorded masterclass mapping the global cybersecurity and AI security career landscape.',
  'Understand the global demand for cybersecurity talent, the highest-paying career tracks, the skills each track requires, and a concrete 12-month roadmap to your first role. Beginner friendly, no prior experience required.',
  'beginner', 0, 60, 8, false, 'masterclass', true
) ON CONFLICT (slug) DO UPDATE SET kind = 'masterclass', published = true;

DO $$
DECLARE mc uuid; m1 uuid; m2 uuid; m3 uuid;
BEGIN
  SELECT id INTO mc FROM public.courses WHERE slug = 'cybersecurity-career-masterclass';

  IF NOT EXISTS (SELECT 1 FROM public.modules WHERE course_id = mc) THEN
    INSERT INTO public.modules (course_id, title, description, order_index)
      VALUES (mc,'The Global Demand','Why the world is short 4 million cybersecurity professionals.',0) RETURNING id INTO m1;
    INSERT INTO public.modules (course_id, title, description, order_index)
      VALUES (mc,'Career Tracks & Salaries','The eight highest-leverage tracks and what they pay.',1) RETURNING id INTO m2;
    INSERT INTO public.modules (course_id, title, description, order_index)
      VALUES (mc,'Your 12-Month Roadmap','A week-by-week plan from zero to hireable.',2) RETURNING id INTO m3;

    INSERT INTO public.lessons (module_id, title, content, video_url, duration_minutes, order_index, is_preview) VALUES
      (m1,'Welcome & how to use this masterclass','A quick orientation to the sessions, resources, and the roadmap you will build by the end.','https://www.youtube.com/embed/dQw4w9WgXcQ',5,0,true),
      (m1,'The 4 million person talent gap','Where the shortage is most acute by region and why hiring managers cannot fill roles.','https://www.youtube.com/embed/dQw4w9WgXcQ',9,1,true),
      (m1,'How AI changed the threat landscape','Adversarial AI, prompt injection, model theft, and the new defensive disciplines.','https://www.youtube.com/embed/dQw4w9WgXcQ',8,2,false),
      (m2,'SOC Analyst and Blue Team','Day in the life, tooling, and the realistic entry salary band.','https://www.youtube.com/embed/dQw4w9WgXcQ',8,0,false),
      (m2,'Offensive security and Red Team','Pentesting, exploit development, and the certifications that matter.','https://www.youtube.com/embed/dQw4w9WgXcQ',8,1,false),
      (m2,'Cloud and AI security engineering','The fastest-growing and highest-paying specialisations right now.','https://www.youtube.com/embed/dQw4w9WgXcQ',7,2,false),
      (m3,'Months 1-6: foundations and labs','Networking, Linux, Python, and the hands-on labs that build real proof of skill.','https://www.youtube.com/embed/dQw4w9WgXcQ',8,0,false),
      (m3,'Months 7-12: certification and job hunt','Choosing a certification, building a portfolio, and passing the interview loop.','https://www.youtube.com/embed/dQw4w9WgXcQ',7,1,false);
  END IF;
END $$;
