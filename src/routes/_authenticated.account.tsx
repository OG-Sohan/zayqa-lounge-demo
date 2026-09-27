import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAccountOverview } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatTime, money } from "@/lib/zayqa-data";

type Overview = Awaited<ReturnType<typeof getAccountOverview>>;

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [
    { title: "Your Account — Zayqa Lounge" },
    { name: "description", content: "View your Zayqa orders and reservations." },
    { name: "robots", content: "noindex" },
    { property: "og:title", content: "Your Zayqa Account" },
    { property: "og:description", content: "Orders and reservations in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Account,
});

const pretty = (s: string) => s.replace(/_/g, " ");

function Account() {
  const load = useServerFn(getAccountOverview);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => { load().then(setData).catch(() => setError("We couldn't load your history.")); }, [load]);
  async function signOut() { await supabase.auth.signOut(); await navigate({ to: "/" }); }
  return <section className="control-room min-h-[80svh] px-5 pb-24 pt-28 sm:px-10 lg:pt-36">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-5">
        <div><p className="text-xs uppercase tracking-[0.18em] text-burgundy">Your Zayqa</p><h1 className="mt-3 text-6xl sm:text-8xl">Orders &amp; tables</h1></div>
        <Button variant="editorial" onClick={signOut}>Sign out</Button>
      </div>
      {error && <p className="mt-10 text-burgundy">{error}</p>}
      {!data && !error && <p className="mt-10">Setting the table…</p>}
      {data && <div className="mt-14 grid gap-14 lg:grid-cols-2">
        <History title="Orders" empty="No saved orders yet." rows={data.orders.map((o) => [o.reference, `${pretty(o.fulfilment)} · ${money(Number(o.total))}`, pretty(o.status)])}/>
        <History title="Reservations" empty="No saved reservations yet." rows={data.reservations.map((r) => [r.reference, `${r.reservation_date} · ${formatTime(String(r.reservation_time))} · ${r.guests} guests`, pretty(r.status)])}/>
      </div>}
    </div>
  </section>;
}

function History({ title, empty, rows }: { title: string; empty: string; rows: string[][] }) {
  return <section>
    <h2 className="text-4xl">{title}</h2>
    {!rows.length
      ? <p className="mt-5 text-muted-foreground">{empty}</p>
      : <div className="mt-5 divide-y divide-border border-y border-border">{rows.map((r) => <div key={r[0]} className="grid grid-cols-[auto_1fr_auto] gap-4 py-5 text-sm"><strong>{r[0]}</strong><span>{r[1]}</span><span className="uppercase text-muted-foreground">{r[2]}</span></div>)}</div>}
  </section>;
}
