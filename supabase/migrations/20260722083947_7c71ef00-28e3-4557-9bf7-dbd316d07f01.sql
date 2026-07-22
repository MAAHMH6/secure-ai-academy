
-- Profile fields for phone signup and business info
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS business_email text;

-- Auto-admin trigger: promote founder email to admin on signup, students otherwise
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

  IF lower(NEW.email) = 'muhammedshams911@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Promote founder if account already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'muhammedshams911@gmail.com'
ON CONFLICT DO NOTHING;

-- Seed 6 additional paid courses
INSERT INTO public.courses (slug, title, subtitle, description, level, price_cents, duration_minutes, lesson_count, is_certification, published)
VALUES
  ('threat-intel-analyst', 'Threat Intelligence Analyst', 'CTI, MITRE ATT&CK, and adversary tracking', 'Build a working threat intelligence program: collection, analysis, dissemination, and MITRE ATT&CK mapping.', 'intermediate', 44900, 1800, 42, false, true),
  ('digital-forensics-fundamentals', 'Digital Forensics Fundamentals', 'Disk, memory, and network forensics', 'Investigate incidents like a digital crime scene — chain of custody, imaging, memory analysis with Volatility.', 'intermediate', 42900, 1500, 38, false, true),
  ('devsecops-pipeline', 'DevSecOps Pipeline Engineering', 'Shift-left security in CI/CD', 'Bake SAST, DAST, IaC scanning, and secret detection into GitHub Actions, GitLab, and Jenkins.', 'advanced', 49900, 1620, 40, false, true),
  ('grc-iso27001-essentials', 'GRC & ISO 27001 Essentials', 'Governance, risk, and compliance from zero', 'Design an ISMS, run risk assessments, and prepare for ISO 27001 certification audits.', 'beginner', 34900, 1200, 30, false, true),
  ('incident-response-playbooks', 'Incident Response Playbooks', 'Contain, eradicate, recover — under pressure', 'Author production-grade IR playbooks for ransomware, BEC, insider threats, and cloud incidents.', 'intermediate', 39900, 1350, 34, false, true),
  ('ai-governance-consultant', 'AI Governance & Risk', 'NIST AI RMF, EU AI Act, and model risk', 'Govern AI systems responsibly — data lineage, bias audits, model cards, and regulatory readiness.', 'advanced', 54900, 1440, 36, false, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed 6 additional SEO blog posts (total 10)
INSERT INTO public.blog_posts (slug, title, excerpt, content, category, published, published_at)
VALUES
  ('cybersecurity-career-roadmap-2026', 'The 2026 Cybersecurity Career Roadmap', 'Six clear steps from IT fundamentals to a specialized security role — without the certification overload.',
   'Cybersecurity isn''t one job — it''s an ecosystem. Start with IT fundamentals (networking, OS, cloud basics), then security foundations, then hands-on labs, and only then pick a specialization. This post walks through each stage with concrete resources, expected timelines, and what employers actually check for in interviews.',
   'Careers', true, now() - interval '2 days'),
  ('soc-analyst-day-in-life', 'A Day in the Life of a SOC Analyst', 'What triage, investigation, and escalation really look like on a modern SOC floor.',
   'From shift handover to ticket triage in SIEM, to correlating alerts across EDR and network logs, to escalating a suspected ransomware precursor — this is what the first two years of a SOC career actually feel like.',
   'Careers', true, now() - interval '5 days'),
  ('cloud-security-aws-vs-azure', 'Cloud Security: AWS vs Azure vs GCP in 2026', 'A practitioner''s comparison of IAM, logging, and native security services across the three hyperscalers.',
   'AWS IAM policies, Azure RBAC + Conditional Access, and GCP IAM bindings all solve the same problem differently. This deep-dive compares native detection stacks (GuardDuty vs Defender vs SCC), identity models, and where each cloud still leaves gaps you must fill yourself.',
   'Cloud', true, now() - interval '8 days'),
  ('phishing-still-works-2026', 'Why Phishing Still Works in 2026 (and How AI Made It Worse)', 'Generative AI removed the grammar tells. Here''s what your controls need to catch instead.',
   'The 2026 phishing wave is polished, personal, and often voice-cloned. Detection now depends on behavior — impossible-travel logins, first-time-seen sender+recipient pairs, and out-of-band verification for financial requests.',
   'Threats', true, now() - interval '11 days'),
  ('genai-red-team-playbook', 'A Red Team Playbook for GenAI Applications', 'Prompt injection, jailbreaks, data exfiltration, and tool abuse — with test cases you can run today.',
   'LLM applications introduce a new attack surface: system prompts, tool calls, RAG pipelines, and agent memory. This playbook maps each surface to concrete red-team tests aligned with OWASP LLM Top 10 and NIST AI RMF.',
   'AI Security', true, now() - interval '14 days'),
  ('zero-trust-real-world', 'Zero Trust Without the Buzzwords', 'Practical implementation steps that reduce blast radius in 90 days — not 90 months.',
   'Forget vendor slideware. Real Zero Trust starts with identity, moves to device posture, segments the most critical apps, and adds continuous verification. This roadmap sequences the work so each phase pays for the next.',
   'Architecture', true, now() - interval '18 days')
ON CONFLICT (slug) DO NOTHING;
