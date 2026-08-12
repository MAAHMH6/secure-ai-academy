import { Link } from "@tanstack/react-router";
import { Shield, Mail, MapPin, Phone, Github, Linkedin, Twitter, MessageSquare } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-gradient-to-b from-background to-surface/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <span className="grid size-7 place-items-center rounded-sm bg-brand/15 ring-1 ring-brand/40">
              <Shield className="size-4 text-brand" strokeWidth={2.5} />
            </span>
            AI Security Hub
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Master Cybersecurity, Cloud &amp; AI Skills for the Future. Rigorous, practitioner-led
            training built for the age of autonomous threats.
          </p>
          <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="size-3.5 text-brand" /> support@aisecurityhub.co</li>
            <li className="flex items-center gap-2"><Mail className="size-3.5 text-brand" /> enterprise@aisecurityhub.co</li>
            <li className="flex items-center gap-2"><Phone className="size-3.5 text-brand" /> +1 307-533-5472 (Call)</li>
            <li className="flex items-center gap-2">
              <MessageSquare className="size-3.5 text-brand" />
              <a href="https://wa.me/13075335472" className="hover:text-foreground">+1 307-533-5472 (WhatsApp)</a>
            </li>
          </ul>
          <div className="mt-6 flex gap-3">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid size-8 place-items-center rounded-md bg-surface ring-1 ring-hairline text-muted-foreground transition-colors hover:text-brand hover:ring-brand/40"
              >
                <Icon className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Learn</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/courses" className="text-muted-foreground transition-colors hover:text-foreground">Courses</Link></li>
            <li><Link to="/certifications" className="text-muted-foreground transition-colors hover:text-foreground">Certifications</Link></li>
            <li><Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link></li>
            <li><Link to="/blog" className="text-muted-foreground transition-colors hover:text-foreground">Blog</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Company</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">About Us</Link></li>
            <li><Link to="/about" hash="mentor" className="text-muted-foreground transition-colors hover:text-foreground">Our Mentor</Link></li>
            <li><Link to="/community" className="text-muted-foreground transition-colors hover:text-foreground">Community</Link></li>
            <li><Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link></li>
            <li><Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">Enterprise</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Stay ahead</div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Monthly threat briefings and study guides — no spam, unsubscribe anytime.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-4 flex overflow-hidden rounded-md bg-surface ring-1 ring-hairline focus-within:ring-brand/40"
          >
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="bg-brand px-3 text-xs font-medium text-brand-foreground">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} AI Security Hub. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link to="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link to="/contact" className="transition-colors hover:text-foreground">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
