
-- =========================================
-- Roles
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'student');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- Profiles
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- Categories
-- =========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- Courses
-- =========================================
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  level public.course_level NOT NULL DEFAULT 'intermediate',
  price_cents INTEGER NOT NULL DEFAULT 0,
  cover_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  lesson_count INTEGER NOT NULL DEFAULT 0,
  is_certification BOOLEAN NOT NULL DEFAULT FALSE,
  cert_code TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT SELECT ON public.courses TO anon;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are public" ON public.courses
  FOR SELECT USING (published = true);
CREATE POLICY "Authors can view own courses" ON public.courses
  FOR SELECT TO authenticated USING (auth.uid() = instructor_id);
CREATE POLICY "Admins can view all courses" ON public.courses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Instructors can insert courses" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors can update own courses" ON public.courses
  FOR UPDATE TO authenticated
  USING (auth.uid() = instructor_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = instructor_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_published ON public.courses(published) WHERE published = true;

-- =========================================
-- Modules & Lessons
-- =========================================
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules public if course published" ON public.modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published = true)
  );
CREATE POLICY "Admins/instructors manage modules" ON public.modules
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.instructor_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.instructor_id = auth.uid())
  );

CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons public if course published" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.published = true
    )
  );
CREATE POLICY "Admins/instructors manage lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.instructor_id = auth.uid()
    )
  );

-- =========================================
-- Enrollments & progress
-- =========================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own enrollments" ON public.enrollments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.lesson_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- Certificates
-- =========================================
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  cert_number TEXT NOT NULL UNIQUE DEFAULT ('AISH-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT SELECT ON public.certificates TO anon;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates are publicly verifiable" ON public.certificates
  FOR SELECT USING (true);
CREATE POLICY "Users insert own certificates" ON public.certificates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage certificates" ON public.certificates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- Reviews
-- =========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users manage own reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_reviews_validate BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

-- =========================================
-- Blog posts
-- =========================================
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  cover_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts public" ON public.blog_posts
  FOR SELECT USING (published = true);
CREATE POLICY "Authors view own posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins view all posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins/authors manage posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = author_id)
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = author_id);
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Seed data
-- =========================================
INSERT INTO public.categories (slug, name, sort_order) VALUES
  ('cybersecurity-fundamentals','Cybersecurity Fundamentals',1),
  ('network-security','Network Security',2),
  ('email-security','Email Security',3),
  ('firewall-security','Firewall Security',4),
  ('endpoint-security','Endpoint Security',5),
  ('data-security','Data Security',6),
  ('cloud-security','Cloud Security',7),
  ('iam','Identity & Access Management',8),
  ('web-security','Web Security',9),
  ('api-security','API Security',10),
  ('devsecops','DevSecOps',11),
  ('soc','SOC Operations',12),
  ('ethical-hacking','Ethical Hacking',13),
  ('ai-security','AI Security',14),
  ('generative-ai-security','Generative AI Security',15),
  ('ai-for-cybersecurity','AI for Cybersecurity',16),
  ('cissp','CISSP',17),
  ('cism','CISM',18),
  ('cisa','CISA',19),
  ('security-plus','CompTIA Security+',20),
  ('ceh','CEH',21),
  ('ccsp','CCSP',22),
  ('aws-security','AWS Security',23),
  ('azure-security','Azure Security',24);

INSERT INTO public.courses (slug, title, subtitle, description, category_id, level, price_cents, duration_minutes, lesson_count, is_certification, cert_code, published)
VALUES
  ('red-teaming-genai','Red Teaming Generative AI Pipelines',
   'Vulnerability research techniques for LLM orchestration and prompt injection mitigation.',
   'A deep hands-on curriculum covering prompt injection, tool-abuse, model exfiltration, and defense-in-depth for LLM-powered products.',
   (SELECT id FROM public.categories WHERE slug='generative-ai-security'),
   'advanced', 19900, 2100, 42, false, NULL, true),
  ('cissp-domain-intensive','CISSP Domain Intensive 2026',
   'Deep dive into the 8 domains of information security with enterprise-grade scenarios.',
   'Full CISSP exam preparation with domain deep dives, practice questions, and case studies.',
   (SELECT id FROM public.categories WHERE slug='cissp'),
   'advanced', 29900, 3600, 64, true, 'CISSP', true),
  ('zero-trust-azure','Zero Trust Architecture for Azure',
   'Designing resilient identity-centric perimeters in multi-cloud environments.',
   'End-to-end zero trust implementation on Azure covering identity, network, workload, and data.',
   (SELECT id FROM public.categories WHERE slug='azure-security'),
   'advanced', 14900, 1400, 28, false, NULL, true),
  ('soc-analyst-track','SOC Analyst Track: Detection & Response',
   'Playbook-driven investigations, threat hunting, and SIEM tuning at scale.',
   'Full stack SOC training from log analysis through incident response and threat hunting.',
   (SELECT id FROM public.categories WHERE slug='soc'),
   'intermediate', 17900, 1800, 36, false, NULL, true),
  ('api-security-mastery','API Security Mastery',
   'OWASP API Top 10, auth patterns, and hardening REST + GraphQL surfaces.',
   'Comprehensive API security including authentication, authorization, and threat modeling.',
   (SELECT id FROM public.categories WHERE slug='api-security'),
   'intermediate', 12900, 1200, 24, false, NULL, true),
  ('aws-security-specialty','AWS Security Specialty',
   'Full preparation for the AWS Security Specialty exam with lab scenarios.',
   'Prepare for the AWS Security Specialty certification with hands-on labs and exam simulators.',
   (SELECT id FROM public.categories WHERE slug='aws-security'),
   'advanced', 24900, 2400, 48, true, 'AWS Sec', true);

INSERT INTO public.blog_posts (slug, title, excerpt, content, category, published, published_at) VALUES
  ('prompt-injection-2026','The State of Prompt Injection in 2026',
   'Attack surfaces have shifted from single prompts to multi-agent tool graphs. Here''s what defenders must know.',
   'Full analysis of prompt injection vectors, from indirect injection via retrieved content to multi-agent tool chaining attacks.',
   'AI Security', true, now() - interval '30 days'),
  ('zero-trust-what-worked','Zero Trust: What Actually Worked in Enterprise Rollouts',
   'Five year retrospective on identity-first perimeter strategy, workload identity, and pitfalls.',
   'A retrospective on real enterprise zero trust rollouts, including what worked and what didn''t.',
   'Cloud Security', true, now() - interval '60 days'),
  ('cissp-study-plan','An Honest 90-Day CISSP Study Plan',
   'Domain-by-domain time budgeting, active recall techniques, and the pitfalls candidates fall into.',
   'A structured, honest 90-day study plan for CISSP with domain-level guidance.',
   'Certifications', true, now() - interval '90 days'),
  ('soc-alert-fatigue','Cutting Alert Fatigue in the Modern SOC',
   'How high-performing detection teams tune signal-to-noise without losing coverage.',
   'Practical strategies for reducing alert fatigue while maintaining coverage in a modern SOC.',
   'SOC', true, now() - interval '120 days');
