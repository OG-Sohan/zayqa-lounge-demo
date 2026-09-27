import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { DEMO_ADMIN, isDemoAdmin } from "@/lib/demo-admin";
import { ensureDemoAdmin } from "@/lib/demo-admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s["next"] === "string" && s["next"].startsWith("/") && !s["next"].startsWith("//") ? s["next"] : "/account",
  }),
  head: () => ({ meta: [{ title: "Sign In — Zayqa Lounge" }, { name: "robots", content: "noindex" }] }),
  component: Auth,
});

async function hasAdminRole(userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

function Auth() {
  const { next } = Route.useSearch();
  const nav = useNavigate();
  const ownerLogin = next.startsWith("/admin");
  const setUpDemoAdmin = useServerFn(ensureDemoAdmin);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signInDemoOwner(email: string, password: string) {
    let result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error && (await hasAdminRole(result.data.user.id))) return result;
    let setupError = "";
    try {
      await setUpDemoAdmin();
    } catch (err) {
      setupError = err instanceof Error ? err.message : String(err);
    }
    result = await supabase.auth.signInWithPassword({ email, password });
    if (setupError && (result.error || !(await hasAdminRole(result.data.user.id))))
      throw new Error(`The demo owner account couldn't be set up on this server (${setupError}).`);
    return result;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    try {
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + next } })
          : ownerLogin && isDemoAdmin(email, password)
            ? await signInDemoOwner(email.trim().toLowerCase(), password)
            : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setError(result.error.message);
      else if (mode === "signup" && !result.data.session) setError("Check your email to confirm your account.");
      else nav({ to: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">{ownerLogin ? "Zayqa Lounge · Owner" : "Zayqa Lounge"}</p>
        <h1>{ownerLogin ? "Owner sign in." : mode === "signin" ? "Welcome back." : "Join us."}</h1>
        <p>{ownerLogin ? "Manage orders, reservations, the menu and site content." : mode === "signin" ? "Your orders and reservations, all in one place." : "Save your details for an easier evening."}</p>
        {ownerLogin && (
          <div className="demo-credentials">
            <span>Demo access</span>
            <p>Email <strong>{DEMO_ADMIN.email}</strong></p>
            <p>Password <strong>{DEMO_ADMIN.password}</strong></p>
          </div>
        )}
        <form onSubmit={submit}>
          <label>Email<Input name="email" type="email" autoComplete="email" required defaultValue={ownerLogin ? DEMO_ADMIN.email : undefined} /></label>
          <label>Password<Input name="password" type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} required defaultValue={ownerLogin ? DEMO_ADMIN.password : undefined} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? "Please wait…" : ownerLogin ? "Sign in to owner view" : mode === "signin" ? "Sign in" : "Create account"}</Button>
        </form>
        {!ownerLogin && (
          <button className="auth-switch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
            {mode === "signin" ? "New to Zayqa? Create an account" : "Already have an account? Sign in"}
          </button>
        )}
      </div>
    </div>
  );
}
