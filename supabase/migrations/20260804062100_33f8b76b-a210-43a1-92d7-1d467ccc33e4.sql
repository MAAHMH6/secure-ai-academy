ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS display_status text NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS free_enroll boolean NOT NULL DEFAULT false;

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_display_status_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_display_status_check
  CHECK (display_status IN ('live','coming_soon','in_development'));

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

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;