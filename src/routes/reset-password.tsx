import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — AI Security Hub" },
      { name: "description", content: "Set a new password for your AI Security Hub account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setOk(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1200);
  }

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center py-16">
        <div className="w-full max-w-md rounded-2xl bg-surface p-8 ring-1 ring-hairline">
          <h1 className="text-2xl font-semibold text-foreground">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {ready ? "Choose a strong password you haven't used elsewhere." : "Verifying your recovery link…"}
          </p>
          {ready ? (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">New password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} className="mt-1 w-full rounded-md bg-background px-3 py-2 text-sm text-foreground ring-1 ring-hairline outline-none focus:ring-brand" />
              </div>
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
              {ok ? <p className="text-xs text-brand">Password updated — redirecting…</p> : null}
              <button type="submit" disabled={busy} className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground ring-1 ring-brand disabled:opacity-50">
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}