import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-background py-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-sm font-semibold text-foreground">AI Security Hub</div>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground">
            Master Cybersecurity, Cloud &amp; AI Skills for the Future. Rigorous training built for
            the age of autonomous threats.
          </p>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Learn
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            <li><Link to="/courses" className="text-muted-foreground hover:text-foreground">Courses</Link></li>
            <li><Link to="/certifications" className="text-muted-foreground hover:text-foreground">Certifications</Link></li>
            <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Company
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-start justify-between gap-4 border-t border-hairline px-6 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
        <p>&copy; {new Date().getFullYear()} AI Security Hub. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Status</a>
        </div>
      </div>
    </footer>
  );
}