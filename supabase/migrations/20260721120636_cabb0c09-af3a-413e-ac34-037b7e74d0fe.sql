
UPDATE public.courses SET price_cents = 29900 WHERE slug = 'api-security-mastery';
UPDATE public.courses SET price_cents = 49900 WHERE slug = 'red-teaming-genai';
UPDATE public.courses SET price_cents = 39900 WHERE slug = 'soc-analyst-track';
UPDATE public.courses SET price_cents = 34900 WHERE slug = 'zero-trust-azure';
UPDATE public.courses SET price_cents = 69900 WHERE slug = 'aws-security-specialty';
UPDATE public.courses SET price_cents = 89900 WHERE slug = 'cissp-domain-intensive';

INSERT INTO public.courses (slug, title, subtitle, price_cents, lesson_count, level, cert_code, is_certification, published)
VALUES
  ('cism-management-bootcamp', 'CISM Management Bootcamp', 'Certified Information Security Manager — governance & risk simulations.', 79900, 52, 'advanced', 'CISM', true, true),
  ('cisa-auditor-track', 'CISA Auditor Track', 'Certified Information Systems Auditor — audit process, governance, and IS controls.', 74900, 48, 'advanced', 'CISA', true, true),
  ('security-plus-fastlane', 'Security+ Fastlane', 'CompTIA Security+ — the industry-standard entry credential with hands-on labs.', 39900, 42, 'beginner', 'Security+', true, true),
  ('ceh-practical-labs', 'CEH v12 Practical Labs', 'Certified Ethical Hacker — offensive tradecraft, exploitation, and reporting.', 59900, 60, 'advanced', 'CEH', true, true),
  ('ccsp-cloud-specialist', 'CCSP Cloud Specialist', 'Certified Cloud Security Professional — architecture, data, and DevOps in the cloud.', 74900, 54, 'advanced', 'CCSP', true, true),
  ('azure-security-engineer', 'Azure Security Engineer', 'Microsoft Azure Security Engineer Associate — identity, platform, and data protection.', 64900, 46, 'intermediate', 'Azure Sec', true, true)
ON CONFLICT (slug) DO UPDATE SET
  price_cents = EXCLUDED.price_cents,
  lesson_count = EXCLUDED.lesson_count,
  published = true,
  is_certification = true,
  cert_code = EXCLUDED.cert_code;
