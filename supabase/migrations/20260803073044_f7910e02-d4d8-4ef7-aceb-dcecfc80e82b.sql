ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url text, ADD COLUMN IF NOT EXISTS resume_name text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, country_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country_code'
  )
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'hamidooshams123@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TABLE IF NOT EXISTS public.community_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_channels TO anon, authenticated;
GRANT ALL ON public.community_channels TO service_role;
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Channels are public" ON public.community_channels FOR SELECT USING (true);
CREATE POLICY "Admins manage channels" ON public.community_channels FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.community_channels (slug, name, description, icon, sort_order) VALUES
  ('announcements','Announcements','Platform updates, new course drops, and live session schedules.','megaphone',1),
  ('soc-analysts','SOC Analysts','Detection engineering, triage playbooks, and alert tuning discussion.','radar',2),
  ('cloud-security','Cloud Security','AWS, Azure, and GCP hardening, IAM, and posture management.','cloud',3),
  ('ai-security','AI & LLM Security','Prompt injection, model theft, and securing AI pipelines.','brain',4),
  ('career-help','Career Help','Resume reviews, interview prep, and salary negotiation.','briefcase',5),
  ('study-groups','Certification Study Groups','Peer study groups for CISSP, CISM, CEH, and more.','users',6)
ON CONFLICT (slug) DO NOTHING;