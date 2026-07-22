import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { PageShell } from "@/components/site/PageShell";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — AI Security Hub" },
      { name: "description", content: "Sign in or create an AI Security Hub account to access courses, labs, and certifications." },
    ],
  }),
  component: AuthPage,
});

const COUNTRIES = [
  { code: "+92", name: "Pakistan" },
  { code: "+1", name: "USA / Canada" },
  { code: "+44", name: "United Kingdom" },
  { code: "+61", name: "Australia" },
  { code: "+91", name: "India" },
  { code: "+971", name: "UAE" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+65", name: "Singapore" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
];

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "forgot">(search.mode ?? "login");
  const [signupMode, setSignupMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("+92");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: search.redirect ?? "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: search.redirect ?? "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, search.redirect]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setInfo("Check your email for a password reset link.");
        return;
      }
      if (mode === "register") {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        const signInIdentifier = signupMode === "email" ? { email } : { phone: `${country}${phone.replace(/^0+/, "")}` };
        const { error } = await supabase.auth.signUp({
          ...signInIdentifier,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: name,
              business_email: businessEmail || null,
              phone: phone || null,
              country_code: country,
            },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message ?? "Google sign-in failed");
  }

  const titles = {
    login: "Sign in to AI Security Hub",
    register: "Create your account",
    forgot: "Reset your password",
  } as const;
  const subtitles = {
    login: "Access your courses, labs, and certificates.",
    register: "Start with hundreds of hands-on lessons.",
    forgot: "We'll email you a secure reset link.",
  } as const;

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center py-16">
        <div className="w-full max-w-md rounded-2xl bg-surface p-8 ring-1 ring-hairline">
          <h1 className="text-2xl font-semibold text-foreground">{titles[mode]}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitles[mode]}</p>

          {mode !== "forgot" ? (
            <>
              <button
                onClick={onGoogle}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-background px-4 py-2.5 text-sm font-medium text-foreground ring-1 ring-hairline transition-colors hover:bg-surface-2"
              >
                <GoogleIcon /> Continue with Google
              </button>
              <div className="my-6 flex items-center gap-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                <div className="h-px flex-1 bg-hairline" /> or {mode === "login" ? "sign in" : "sign up"} with{" "}
                {mode === "register" ? (
                  <span className="inline-flex overflow-hidden rounded-full ring-1 ring-hairline">
                    <button type="button" onClick={() => setSignupMode("email")} className={`px-2 py-0.5 ${signupMode === "email" ? "bg-brand text-brand-foreground" : ""}`}>Email</button>
                    <button type="button" onClick={() => setSignupMode("phone")} className={`px-2 py-0.5 ${signupMode === "phone" ? "bg-brand text-brand-foreground" : ""}`}>Phone</button>
                  </span>
                ) : (
                  "email"
                )}
                <div className="h-px flex-1 bg-hairline" />
              </div>
            </>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                </div>
                {signupMode === "email" ? (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Phone number</label>
                    <div className="mt-1 flex gap-2">
                      <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-28 rounded-md bg-background px-2 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand">
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                      </select>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="3088444451" className="flex-1 rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Business email (optional)</label>
                  <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                </div>
                {mode === "login" ? (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
                    <button type="button" onClick={() => setMode("forgot")} className="mt-2 text-xs font-medium text-brand hover:underline">
                      Forgot password?
                    </button>
                  </div>
                ) : null}
              </>
            )}

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            {info ? <p className="text-xs text-brand">{info}</p> : null}

            <button type="submit" disabled={busy} className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand disabled:opacity-50">
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : mode === "register" ? "Already have one? " : "Remembered it? "}
            <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-medium text-brand hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            By continuing you agree to our <Link to="/terms" className="hover:text-foreground">Terms</Link> and{" "}
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-1.6 4-5.4 4-3.2 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.6 14.7 2.6 12 2.6 6.9 2.6 2.8 6.7 2.8 12S6.9 21.4 12 21.4c6.9 0 11.5-4.8 11.5-11.6 0-.8-.1-1.4-.2-2H12z" />
    </svg>
  );
}