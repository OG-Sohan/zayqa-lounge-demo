import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { images } from "@/lib/zayqa-data";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { ensureDemoAccount, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Account — Zayqa Lounge" },
    { name: "description", content: "Sign in to your optional Zayqa Lounge account." },
    { name: "robots", content: "noindex" },
    { property: "og:title", content: "Your Zayqa Account" },
    { property: "og:description", content: "View saved orders and reservations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const ensureDemo = useServerFn(ensureDemoAccount);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim(), password = String(f.get("password"));
    const isDemo = email.toLowerCase() === DEMO_EMAIL;
    try {
      let setupError = "";
      if (isDemo) {
        // The account may already exist from the migration, so a failed setup is only reported if sign-in fails too.
        try { await ensureDemo(); } catch (err) { setupError = err instanceof Error ? err.message : String(err); }
      }
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        setMessage(setupError
          ? `The demo admin account hasn't been created in the database yet, and this server couldn't create it (${setupError}). Run the demo admin migration in Lovable, or sign in once on the Lovable preview.`
          : result.error.message);
        return;
      }
      await navigate({ to: isDemo ? "/admin" : "/account" });
    } catch {
      setMessage("Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="control-room grid min-h-screen pt-16 lg:grid-cols-2 lg:pt-20">
    <img src={images.table} alt="A table at Zayqa Lounge" className="hidden h-[calc(100vh-5rem)] w-full object-cover lg:block"/>
    <div className="flex items-center px-5 py-16 sm:px-12">
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.18em] text-burgundy">Optional account</p>
        <h1 className="mt-4 text-6xl">Welcome to Zayqa.</h1>
        <p className="mt-4 text-muted-foreground">You never need an account to order or reserve. Sign in only to keep your history together.</p>
        <div className="premium-card mt-8 border border-input p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-burgundy">Demo admin access</p>
          <p className="mt-2">Email: <strong>{DEMO_EMAIL}</strong></p>
          <p>Password: <strong>{DEMO_PASSWORD}</strong></p>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div><Label htmlFor="email">Email</Label><Input id="email" name="email" defaultValue={DEMO_EMAIL} type="email" autoComplete="email" required className="mt-2 rounded-none"/></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" name="password" defaultValue={DEMO_PASSWORD} type="password" autoComplete="current-password" minLength={8} required className="mt-2 rounded-none"/></div>
          {message && <p role="status" className="text-sm text-burgundy">{message}</p>}
          <Button type="submit" variant="burgundy" size="lg" className="w-full" disabled={busy}>{busy ? "Please wait…" : "Sign in"}</Button>
        </form>
      </div>
    </div>
  </section>;
}
