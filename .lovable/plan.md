This transformation is roughly 6–8 turns of work. Trying to ship it in one migration + one code pass will corrupt the schema and break the live app. Here is the phased plan — I'll execute Phase 1 as soon as you approve, then continue phase by phase.

**Decisions locked in from your answers**
- Placeholder masterclass content, editable from admin
- Pricing shown in USD (primary) with PKR (secondary)
- One signup form: email + password required, phone optional (with country code), Google button stays for you to enable later
- No hardcoded admin credentials — `muhammedshams911@gmail.com` continues to auto-get the `admin` role via trigger; you set the password via signup / reset

---

**Phase 1 — Homepage + Pricing + Auth (this turn)**
- Reorder homepage exactly as specified (Hero → Masterclass → Registration CTA → Why → Domains → Featured → Certs → Roadmap → Founder → Mentor → Dashboard Preview → Analytics → Community → Success Stories → FAQ → Newsletter → Footer)
- Hero CTAs → "Reserve Free Seat" / "Explore Courses"
- Masterclass hero block: FREE / 60 min / Recorded / Beginner Friendly / Career Roadmap badges
- New Pricing: Starter (Free) / Career ($29 · PKR 2,999) / Professional ($79 · PKR 7,999) / Enterprise (Custom) — cert packs kept
- Career Roadmap visual, Student Success placeholder careers, FAQ, Newsletter sections
- Auth: single email/password form, phone optional with country code, Google button preserved
- Every course card gets Difficulty / Duration / Lessons / Projects / Labs / Certificate / Instructor / Students / Rating (data-driven where present, sensible defaults where not)
- Every cert card gets Difficulty / Study Hours / Labs / Exam Simulator / Projects / Salary / Career Paths

**Phase 2 — LMS schema + Course/Masterclass/Cert learning experience**
- Migration: add `masterclasses` table (or `courses.kind`), `masterclass_registrations`, `lesson_resources`, `achievements`, `user_xp`, `user_streaks`, `user_badges`, extend `profiles` with CRM fields (lead_source, country, experience, interested_domain, last_login)
- Masterclass flow: Reserve Free Seat → login → registration form (all specified fields) → details page → Enroll → appears in dashboard
- Course detail page with expandable Module → Lesson accordion
- Lesson player page: video, notes, resources, prev/next, mark complete, sequential unlock
- Seeded placeholder Masterclass with 3 modules

**Phase 3 — Student Dashboard rebuild**
- Progress circle, Current/Completed courses, Certificates, Achievements, Learning graph, XP, Streak, Upcoming lessons, Recommended courses, AI recommendations (rules-based), Downloads, Calendar

**Phase 4 — Unified Admin Panel (sidebar shell)**
- Collapse existing admin pages into one `/admin` layout with sidebar
- Groups: Overview (Dashboard, Analytics) · Users (Users, Students, Instructors, Roles) · Learning (Courses, Modules, Lessons, Masterclasses, Certifications, Enrollments) · Content (Blog, Testimonials, Homepage, Mentor) · Marketing (Landing Pages, Email Templates, Campaigns, Coupons) · CRM · Commerce (Orders, Payments) · Settings (Integrations, Security, System)
- Full CRUD for Courses / Modules / Lessons with drag-reorder
- Masterclass & Certification managers reuse the same course builder

**Phase 5 — Gamification + CRM + Community**
- XP awarded on lesson complete, streak tracking, badges, leaderboard page
- CRM view over profiles + enrollments + registrations
- Community channel scaffolding (read-only placeholders unless you want real chat — separate turn)

**Phase 6 — Polish, SEO, empty states, tests**

---

**Technical notes**
- Every new `public` table ships with GRANTs + RLS + owner policies in the same migration
- Admin gate stays role-based (`has_role(auth.uid(),'admin')`) — no hardcoded passwords anywhere
- All prices stored as `price_cents` USD; PKR shown as computed display only (fixed FX in `site-data.ts`) so admin only edits one number
- Placeholder video for masterclass lessons: a YouTube URL field on `lessons`, editable in admin

Approve and I'll execute Phase 1 immediately, then continue.