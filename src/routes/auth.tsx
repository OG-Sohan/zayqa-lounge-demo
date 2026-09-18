import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

function Auth() {
  const { next } = Route.useSearch();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + next } });
    setBusy(false);
    if (result.error) setError(result.error.message);
    else if (mode === "signup" && !result.data.session) setError("Check your email to confirm your account.");
    else nav({ to: next });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Zayqa Lounge</p>
        <h1>{mode === "signin" ? "Welcome back." : "Join us."}</h1>
        <p>{mode === "signin" ? "Your orders and reservations, all in one place." : "Save your details for an easier evening."}</p>
        <form onSubmit={submit}>
          <label>Email<Input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<Input name="password" type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
          {mode === "signin" ? "New to Zayqa? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
