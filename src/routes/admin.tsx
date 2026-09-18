import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/zayqa-data";
import {
  deleteMenuItem,
  getAdminDashboard,
  updateEnquiryStatus,
  updateOrderStatus,
  updateReservationStatus,
  upsertMenuItem,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Owner — Zayqa Lounge" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Admin,
});

const ORDER_STATUSES = ["received", "confirmed", "preparing", "ready", "on_the_way", "completed", "cancelled"] as const;
const RESERVATION_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
const ENQUIRY_STATUSES = ["new", "in_progress", "resolved"] as const;

type Tables = Database["public"]["Tables"];
interface Dashboard {
  orders: Tables["orders"]["Row"][];
  orderItems: Tables["order_items"]["Row"][];
  reservations: Tables["reservations"]["Row"][];
  enquiries: Tables["enquiries"]["Row"][];
  menuItems: Tables["menu_items"]["Row"][];
  categories: Tables["menu_categories"]["Row"][];
}
type MenuItemRow = Tables["menu_items"]["Row"];
type Tab = "overview" | "orders" | "reservations" | "menu" | "enquiries";

const pretty = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function Admin() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const queryClient = useQueryClient();
  const fetchDashboard = useServerFn(getAdminDashboard);

  useState(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (!data.user) { setIsAdmin(false); return; }
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!role);
    })();
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboard as () => Promise<Dashboard>,
    enabled: isAdmin === true,
  });

  if (user === undefined || isAdmin === null)
    return <div className="confirmation"><h1>Opening owner view…</h1></div>;
  if (!user)
    return (
      <div className="empty-state page">
        <h1>Owner sign in</h1>
        <p>This area is for the Zayqa team.</p>
        <Button asChild><Link to="/auth" search={{ next: "/admin" }}>Sign in</Link></Button>
      </div>
    );
  if (!isAdmin)
    return (
      <div className="empty-state page">
        <h1>Private area</h1>
        <p>{user.email} does not have owner access.</p>
        <Button asChild><Link to="/">Return to the restaurant</Link></Button>
      </div>
    );

  const orders = data?.orders ?? [];
  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  const upcoming = (data?.reservations ?? []).filter((r) => !["cancelled", "completed"].includes(r.status)).length;
  const newEnquiries = (data?.enquiries ?? []).filter((e) => e.status === "new").length;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: `Orders (${activeOrders})` },
    { id: "reservations", label: `Reservations (${upcoming})` },
    { id: "menu", label: "Menu" },
    { id: "enquiries", label: `Enquiries (${newEnquiries})` },
  ];

  return (
    <div className="admin-page">
      <aside>
        <span className="wordmark">ZAYQA</span>
        <p>Owner</p>
        <nav>
          {tabs.map((t) => (
            <a key={t.id} href="#" className={tab === t.id ? "active" : ""} onClick={(e) => { e.preventDefault(); setTab(t.id); }}>
              {t.label}
            </a>
          ))}
        </nav>
        <Link to="/">View restaurant ↗</Link>
      </aside>
      <main>
        {isLoading && <p className="demo-note">Loading the restaurant…</p>}
        {error && <p className="form-error" role="alert">Could not load owner data. <button type="button" onClick={() => refetch()}>Try again</button></p>}
        {data && tab === "overview" && <Overview data={data} activeOrders={activeOrders} upcoming={upcoming} newEnquiries={newEnquiries} go={setTab} />}
        {data && tab === "orders" && <Orders data={data} onChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })} />}
        {data && tab === "reservations" && <Reservations data={data} onChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })} />}
        {data && tab === "menu" && <MenuManager data={data} onChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })} />}
        {data && tab === "enquiries" && <Enquiries data={data} onChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })} />}
      </main>
    </div>
  );
}

function Overview({ data, activeOrders, upcoming, newEnquiries, go }: { data: Dashboard; activeOrders: number; upcoming: number; newEnquiries: number; go: (t: Tab) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = data.orders.filter((o) => o.created_at.slice(0, 10) === today);
  const revenue = todayOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  return (
    <>
      <p className="eyebrow">Owner overview</p>
      <h1>Good evening.</h1>
      <section className="admin-metrics">
        <article><span>Active orders</span><strong>{activeOrders}</strong></article>
        <article><span>Upcoming tables</span><strong>{upcoming}</strong></article>
        <article><span>New enquiries</span><strong>{newEnquiries}</strong></article>
        <article><span>Today's takings</span><strong>{money(revenue)}</strong></article>
      </section>
      <section className="admin-foundation">
        <article><h2>Orders</h2><p>Move orders from received through preparing to ready or on the way.</p><Button onClick={() => go("orders")}>Open order board</Button></article>
        <article><h2>Reservations</h2><p>Confirm pending requests and see who is dining and when.</p><Button onClick={() => go("reservations")}>Open reservation book</Button></article>
        <article><h2>Menu</h2><p>Change dishes, prices, availability and featured plates.</p><Button onClick={() => go("menu")}>Edit menu</Button></article>
        <article><h2>Enquiries</h2><p>Private dining and contact messages from guests.</p><Button onClick={() => go("enquiries")}>Read enquiries</Button></article>
      </section>
    </>
  );
}

function Orders({ data, onChanged }: { data: Dashboard; onChanged: () => void }) {
  const setStatus = useServerFn(updateOrderStatus);
  const [busy, setBusy] = useState("");
  const itemsFor = (id: string) => data.orderItems.filter((i) => i.order_id === id);
  return (
    <>
      <p className="eyebrow">Orders</p>
      <h1>Who's buying.</h1>
      {data.orders.length === 0 && <p className="demo-note">No orders yet.</p>}
      <div className="admin-list">
        {data.orders.map((o) => (
          <article key={o.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <strong>#{o.order_number}</strong> · {o.customer_name} · {o.phone}
                <p>{pretty(o.fulfilment)}{o.address ? ` · ${o.address}` : ""}{o.requested_time ? ` · ${o.requested_time}` : ""}</p>
                <p>{new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="admin-card-side">
                <strong>{money(Number(o.total))}</strong>
                <select value={o.status} disabled={busy === o.id} onChange={async (e) => { setBusy(o.id); await setStatus({ data: { id: o.id, status: e.target.value as typeof ORDER_STATUSES[number] } }); setBusy(""); onChanged(); }}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
                </select>
              </div>
            </div>
            {itemsFor(o.id).length > 0 && (
              <ul className="admin-order-items">
                {itemsFor(o.id).map((i) => <li key={i.id}>{i.quantity} × {i.item_name} — {money(Number(i.unit_price) * i.quantity)}</li>)}
              </ul>
            )}
            {o.instructions && <p className="demo-note">“{o.instructions}”</p>}
          </article>
        ))}
      </div>
    </>
  );
}

function Reservations({ data, onChanged }: { data: Dashboard; onChanged: () => void }) {
  const setStatus = useServerFn(updateReservationStatus);
  const [busy, setBusy] = useState("");
  return (
    <>
      <p className="eyebrow">Reservations</p>
      <h1>Who's booking.</h1>
      {data.reservations.length === 0 && <p className="demo-note">No reservations yet.</p>}
      <div className="admin-list">
        {data.reservations.map((r) => (
          <article key={r.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <strong>{r.guest_name}</strong> · {r.guests} guests
                <p>{r.reservation_date} at {String(r.reservation_time).slice(0, 5)} · {r.email} · {r.phone}</p>
                <p>Code {r.confirmation_code}</p>
                {r.notes && <p>“{r.notes}”</p>}
              </div>
              <div className="admin-card-side">
                <select value={r.status} disabled={busy === r.id} onChange={async (e) => { setBusy(r.id); await setStatus({ data: { id: r.id, status: e.target.value as typeof RESERVATION_STATUSES[number] } }); setBusy(""); onChanged(); }}>
                  {RESERVATION_STATUSES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Enquiries({ data, onChanged }: { data: Dashboard; onChanged: () => void }) {
  const setStatus = useServerFn(updateEnquiryStatus);
  const [busy, setBusy] = useState("");
  return (
    <>
      <p className="eyebrow">Enquiries</p>
      <h1>Guest messages.</h1>
      {data.enquiries.length === 0 && <p className="demo-note">No enquiries yet.</p>}
      <div className="admin-list">
        {data.enquiries.map((e) => (
          <article key={e.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <strong>{e.name}</strong> · {pretty(e.enquiry_type)}
                <p>{e.email}{e.phone ? ` · ${e.phone}` : ""}</p>
                {e.event_date && <p>{e.event_date}{e.guests ? ` · ${e.guests} guests` : ""}{e.occasion ? ` · ${e.occasion}` : ""}</p>}
                <p>“{e.message}”</p>
              </div>
              <div className="admin-card-side">
                <select value={e.status} disabled={busy === e.id} onChange={async (ev) => { setBusy(e.id); await setStatus({ data: { id: e.id, status: ev.target.value as typeof ENQUIRY_STATUSES[number] } }); setBusy(""); onChanged(); }}>
                  {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

const blankItem = (categoryId: string) => ({
  category_id: categoryId,
  slug: "",
  name: "",
  description: "",
  price: 10,
  image_key: "table",
  ingredients: [] as string[],
  allergens: [] as string[],
  dietary: [] as string[],
  add_ons: [] as { name: string; price: number }[],
  is_featured: false,
  is_available: true,
});

function MenuManager({ data, onChanged }: { data: Dashboard; onChanged: () => void }) {
  const [editing, setEditing] = useState<(MenuItemRow & { ingredients: string[]; allergens: string[]; dietary: string[]; add_ons: { name: string; price: number }[] }) | ReturnType<typeof blankItem> | null>(null);
  const save = useServerFn(upsertMenuItem);
  const remove = useServerFn(deleteMenuItem);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true); setError("");
    const f = new FormData(e.currentTarget);
    try {
      await save({
        data: {
          ...("id" in editing && editing.id ? { id: editing.id } : {}),
          category_id: String(f.get("category_id")),
          slug: String(f.get("slug")),
          name: String(f.get("name")),
          description: String(f.get("description")),
          price: Number(f.get("price")),
          image_key: String(f.get("image_key")) || null,
          ingredients: String(f.get("ingredients")).split(",").map((s) => s.trim()).filter(Boolean),
          allergens: String(f.get("allergens")).split(",").map((s) => s.trim()).filter(Boolean),
          dietary: String(f.get("dietary")).split(",").map((s) => s.trim()).filter(Boolean),
          add_ons: String(f.get("add_ons")).split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
            const [name, price] = s.split(":").map((x) => x.trim());
            return { name, price: Number(price) || 0 };
          }),
          is_featured: f.get("is_featured") === "on",
          is_available: f.get("is_available") === "on",
        },
      });
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the dish.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    const item = editing;
    return (
      <>
        <p className="eyebrow">Menu</p>
        <h1>{"id" in item && item.id ? "Edit dish." : "New dish."}</h1>
        <form className="admin-form" onSubmit={submit}>
          <div className="field-grid">
            <label>Name<Input name="name" required defaultValue={item.name} /></label>
            <label>Slug<Input name="slug" required pattern="[a-z0-9-]+" defaultValue={item.slug} placeholder="smoked-lamb-chops" /></label>
          </div>
          <label>Description<Textarea name="description" required defaultValue={item.description} /></label>
          <div className="field-grid">
            <label>Price ($)<Input name="price" required type="number" step="0.01" min="0" defaultValue={Number(item.price)} /></label>
            <label>Category
              <select name="category_id" defaultValue={item.category_id}>
                {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <div className="field-grid">
            <label>Image key<Input name="image_key" defaultValue={item.image_key ?? "table"} placeholder="biryani, lamb, seabass, dessert, table, kitchen" /></label>
            <label>Dietary (comma separated)<Input name="dietary" defaultValue={item.dietary.join(", ")} placeholder="Halal, Gluten-free" /></label>
          </div>
          <label>Ingredients (comma separated)<Input name="ingredients" defaultValue={item.ingredients.join(", ")} /></label>
          <label>Allergens (comma separated)<Input name="allergens" defaultValue={item.allergens.join(", ")} /></label>
          <label>Add-ons (name:price, comma separated)<Input name="add_ons" defaultValue={item.add_ons.map((a) => `${a.name}:${a.price}`).join(", ")} placeholder="Extra lamb:8, Garlic naan:5" /></label>
          <div className="admin-checks">
            <label><input type="checkbox" name="is_available" defaultChecked={item.is_available} /> Available to order</label>
            <label><input type="checkbox" name="is_featured" defaultChecked={item.is_featured} /> Featured on the homepage</label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="admin-form-actions">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save dish"}</Button>
            <Button type="button" variant="text" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <p className="eyebrow">Menu</p>
      <h1>Every dish, yours to shape.</h1>
      <Button onClick={() => setEditing(blankItem(data.categories[0]?.id ?? ""))}>Add a new dish</Button>
      {data.categories.map((c) => (
        <section key={c.id} className="admin-menu-category">
          <h2>{c.name}</h2>
          <div className="admin-list">
            {data.menuItems.filter((i) => i.category_id === c.id).map((i) => (
              <article key={i.id} className="admin-card">
                <div className="admin-card-head">
                  <div>
                    <strong>{i.name}</strong> — {money(Number(i.price))}
                    <p>{i.is_available ? "Available" : "Hidden from guests"}{i.is_featured ? " · Featured" : ""}</p>
                  </div>
                  <div className="admin-card-side admin-card-actions">
                    <Button variant="outline" onClick={() => setEditing({ ...i, ingredients: i.ingredients ?? [], allergens: i.allergens ?? [], dietary: i.dietary ?? [], add_ons: (i.add_ons as { name: string; price: number }[]) ?? [] })}>Edit</Button>
                    <Button variant="text" disabled={busy} onClick={async () => { if (!confirm(`Remove ${i.name} from the menu?`)) return; setBusy(true); await remove({ data: { id: i.id } }); setBusy(false); onChanged(); }}>Remove</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
