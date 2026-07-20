import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

const nav = [
  { to: "/courses", label: "Courses" },
  { to: "/certifications", label: "Certifications" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-hairline bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <span className="grid size-6 place-items-center rounded-sm bg-brand/15 ring-1 ring-brand/40">
              <Shield className="size-3.5 text-brand" strokeWidth={2.5} />
            </span>
            AI Security Hub
          </Link>
          <div className="hidden gap-6 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand transition-transform active:scale-95"
          >
            Start Training
          </Link>
        </div>
      </div>
    </nav>
  );
}