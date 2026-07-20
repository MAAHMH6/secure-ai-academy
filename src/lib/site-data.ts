export const CATEGORIES = [
  "Cybersecurity Fundamentals",
  "Network Security",
  "Email Security",
  "Firewall Security",
  "Endpoint Security",
  "Data Security",
  "Cloud Security",
  "IAM",
  "Web Security",
  "API Security",
  "DevSecOps",
  "SOC Operations",
  "Ethical Hacking",
  "AI Security",
  "Generative AI Security",
  "AI for Cybersecurity",
  "CISSP",
  "CISM",
  "CISA",
  "Security+",
  "CEH",
  "CCSP",
  "AWS Security",
  "Azure Security",
] as const;

export const FEATURED_COURSES = [
  {
    slug: "red-teaming-genai",
    title: "Red Teaming Generative AI Pipelines",
    tag: "Adv. Technical",
    lessons: 42,
    price: 199,
    blurb:
      "Vulnerability research techniques for LLM orchestration and prompt injection mitigation.",
  },
  {
    slug: "cissp-domain-intensive",
    title: "CISSP Domain Intensive 2026",
    tag: "Certification",
    lessons: 64,
    price: 299,
    blurb: "Deep dive into the 8 domains of information security with enterprise-grade scenarios.",
  },
  {
    slug: "zero-trust-azure",
    title: "Zero Trust Architecture for Azure",
    tag: "Cloud",
    lessons: 28,
    price: 149,
    blurb: "Designing resilient identity-centric perimeters in multi-cloud environments.",
  },
  {
    slug: "soc-analyst-track",
    title: "SOC Analyst Track: Detection & Response",
    tag: "SOC",
    lessons: 36,
    price: 179,
    blurb: "Playbook-driven investigations, threat hunting, and SIEM tuning at scale.",
  },
  {
    slug: "api-security-mastery",
    title: "API Security Mastery",
    tag: "Web",
    lessons: 24,
    price: 129,
    blurb: "OWASP API Top 10, auth patterns, and hardening REST + GraphQL surfaces.",
  },
  {
    slug: "aws-security-specialty",
    title: "AWS Security Specialty",
    tag: "Cloud",
    lessons: 48,
    price: 249,
    blurb: "Full preparation for the AWS Security Specialty exam with lab scenarios.",
  },
] as const;

export const CERTIFICATIONS = [
  { code: "CISSP", name: "Certified Information Systems Security Professional", hours: 40 },
  { code: "CISM", name: "Certified Information Security Manager", hours: 30 },
  { code: "CISA", name: "Certified Information Systems Auditor", hours: 32 },
  { code: "Security+", name: "CompTIA Security+", hours: 28 },
  { code: "CEH", name: "Certified Ethical Hacker v12", hours: 55 },
  { code: "CCSP", name: "Certified Cloud Security Professional", hours: 36 },
  { code: "AWS Sec", name: "AWS Certified Security Specialty", hours: 48 },
  { code: "Azure Sec", name: "Microsoft Azure Security Engineer", hours: 42 },
] as const;

export const PRICING_TIERS = [
  {
    name: "Individual",
    price: 29,
    cadence: "/month",
    description: "For self-directed learners building foundational skills.",
    features: [
      "Access to 40+ foundational courses",
      "Community forums",
      "Course certificates",
      "Cancel anytime",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: 79,
    cadence: "/month",
    description: "For working practitioners and certification candidates.",
    features: [
      "Everything in Individual",
      "All 140+ courses & certification tracks",
      "Hands-on virtual labs",
      "Exam prep simulators",
      "Priority support",
    ],
    cta: "Go Professional",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: null,
    cadence: "custom",
    description: "For security teams, SOCs, and compliance-driven organizations.",
    features: [
      "SSO, SCIM, and audit logs",
      "Custom learning paths",
      "Dedicated success manager",
      "Team analytics & reporting",
      "Volume licensing",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
] as const;

export const BLOG_POSTS = [
  {
    slug: "prompt-injection-2026",
    title: "The State of Prompt Injection in 2026",
    date: "2026-06-14",
    category: "AI Security",
    excerpt:
      "Attack surfaces have shifted from single prompts to multi-agent tool graphs. Here's what defenders must know.",
  },
  {
    slug: "zero-trust-what-worked",
    title: "Zero Trust: What Actually Worked in Enterprise Rollouts",
    date: "2026-05-02",
    category: "Cloud Security",
    excerpt:
      "Five year retrospective on identity-first perimeter strategy, workload identity, and pitfalls.",
  },
  {
    slug: "cissp-study-plan",
    title: "An Honest 90-Day CISSP Study Plan",
    date: "2026-04-11",
    category: "Certifications",
    excerpt:
      "Domain-by-domain time budgeting, active recall techniques, and the pitfalls candidates fall into.",
  },
  {
    slug: "soc-alert-fatigue",
    title: "Cutting Alert Fatigue in the Modern SOC",
    date: "2026-03-20",
    category: "SOC",
    excerpt: "How high-performing detection teams tune signal-to-noise without losing coverage.",
  },
] as const;