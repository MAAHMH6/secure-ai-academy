import { Link } from "@tanstack/react-router";
import { Shield, LogOut, UserCircle2, ShieldCheck } from "lucide-react";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/courses", label: "Courses" },
  { to: "/certifications", label: "Certifications" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { session, loading, user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);
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
          {loading ? null : session ? (
            <>
              <Link to="/profile" className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex" aria-label="Profile">
                <UserCircle2 className="size-5" />
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1.5 text-xs font-medium text-brand ring-1 ring-brand/40 transition-colors hover:bg-brand/10"
                  aria-label="Admin panel"
                >
                  <ShieldCheck className="size-3.5" />
                  Admin
                </Link>
              ) : null}
              <Link
                to="/dashboard"
                className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand transition-transform active:scale-95"
              >
                Dashboard
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                aria-label="Sign out"
                className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground ring-1 ring-brand transition-transform active:scale-95"
              >
                Start Training
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}