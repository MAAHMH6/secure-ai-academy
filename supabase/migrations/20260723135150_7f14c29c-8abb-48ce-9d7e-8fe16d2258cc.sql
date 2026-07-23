CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content public read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "site_content admin write" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_content (key, value) VALUES (
  'mentor',
  jsonb_build_object(
    'photo_url', '/__l5e/assets-v1/5beb65f4-fb8f-4df3-8692-cb20c0c4288f/mentor.jpg',
    'name', 'Our Mentor',
    'headline', '25+ years cybersecurity consulting',
    'bio', 'Our mentor is a veteran cybersecurity consultant with more than two and a half decades of hands-on experience advising enterprises, governments, and critical-infrastructure operators. He has led security programs across banking, telecom, and energy sectors, mentors Professional-tier learners, and shapes our curriculum against real-world incident data.',
    'stats', jsonb_build_array(
      jsonb_build_object('k','25+','v','Years experience'),
      jsonb_build_object('k','500+','v','Practitioners mentored'),
      jsonb_build_object('k','40+','v','Enterprise engagements')
    )
  )
);