import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Edit3, LogOut, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { RESTAURANT_SETTINGS_KEY } from "@/hooks/use-restaurant";
import {
  assignUserRole,
  getManagementOverview,
  menuImageKeys,
  removeEnquiry,
  removeManagedMenuItem,
  removeUserRole,
  saveManagedMenuItem,
  saveRestaurantSettings,
  updateOrderStatus,
  updateReservationStatus,
  type ManagedDish,
  type MenuImageKey,
} from "@/lib/account.functions";
import { formatTime, money } from "@/lib/zayqa-data";

type Overview = Awaited<ReturnType<typeof getManagementOverview>>;
// List and price fields are edited as raw text so commas and decimal points survive typing.
type EditableDish = Omit<ManagedDish, "image" | "ingredients" | "allergens" | "price"> & { ingredients: string; allergens: string; price: string };

const toEditable = ({ image: _image, ...dish }: ManagedDish): EditableDish => ({ ...dish, ingredients: dish.ingredients.join(", "), allergens: dish.allergens.join(", "), price: String(dish.price) });

const blankDish = (categoryId = ""): EditableDish => ({
  id: "",
  slug: "",
  name: "",
  categoryId,
  description: "",
  ingredients: "",
  allergens: "",
  dietary: "",
  price: "",
  imageKey: "table",
  imageUrl: null,
  featured: false,
  available: true,
});

const UPLOADED = "__uploaded";
const orderStatuses = ["received", "confirmed", "preparing", "ready", "on_the_way", "completed", "cancelled"] as const;
const reservationStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;
const roles = ["customer", "staff", "manager", "admin", "superadmin"] as const;
const tabs = ["menu", "orders", "reservations", "enquiries", "settings", "roles"] as const;
const pretty = (s: string) => s.replace(/_/g, " ");

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Restaurant Management — Zayqa Lounge" },
    { name: "description", content: "Protected Zayqa Lounge restaurant management." },
    { name: "robots", content: "noindex" },
    { property: "og:title", content: "Zayqa Management" },
    { property: "og:description", content: "Protected restaurant operations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Admin,
});

function Admin() {
  const load = useServerFn(getManagementOverview);
  const saveSettings = useServerFn(saveRestaurantSettings);
  const saveDish = useServerFn(saveManagedMenuItem);
  const deleteDish = useServerFn(removeManagedMenuItem);
  const setOrderStatus = useServerFn(updateOrderStatus);
  const setReservationStatus = useServerFn(updateReservationStatus);
  const deleteEnquiry = useServerFn(removeEnquiry);
  const addRole = useServerFn(assignUserRole);
  const deleteRole = useServerFn(removeUserRole);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [data, setData] = useState<Overview | null>(null);
  const [active, setActive] = useState<(typeof tabs)[number]>("menu");
  const [editingDish, setEditingDish] = useState<EditableDish>(blankDish());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => load().then((overview) => {
    setData(overview);
    setEditingDish((dish) => dish.categoryId ? dish : { ...dish, categoryId: overview.categories[0]?.id ?? "" });
  }).catch(() => setError("This workspace is available to Zayqa managers only.")), [load]);
  useEffect(() => { void refresh(); }, [refresh]);

  const groupedMenu = useMemo(() => (data?.categories ?? []).map((category) => ({
    category,
    items: data?.menuItems.filter((item) => item.categoryId === category.id) ?? [],
  })), [data]);

  async function run(action: () => Promise<unknown>, success?: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      if (success) setMessage(success);
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "That change didn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async () => {
      await saveSettings({ data: {
        name: String(form.get("name")),
        tagline: String(form.get("tagline")),
        secondaryPhrase: String(form.get("secondaryPhrase")),
        phone: String(form.get("phone")),
        email: String(form.get("email")),
        address: String(form.get("address")),
        hours: String(form.get("hours")),
      } });
      await queryClient.invalidateQueries({ queryKey: RESTAURANT_SETTINGS_KEY });
    }, "Restaurant details saved.");
  }

  function submitDish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { id, ...fields } = editingDish;
    const dish = { ...fields, ingredients: splitList(fields.ingredients), allergens: splitList(fields.allergens), price: Number(fields.price) };
    void run(async () => {
      const saved = await saveDish({ data: id ? { ...dish, id } : dish });
      setEditingDish(toEditable(saved));
      setMessage(`${saved.name} saved.`);
    });
  }

  function removeDish(item: ManagedDish) {
    if (!confirm(`Remove ${item.name} from the menu?`)) return;
    void run(async () => {
      await deleteDish({ data: { id: item.id } });
      setEditingDish(blankDish(data?.categories[0]?.id));
    }, "Dish removed.");
  }

  function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    void run(async () => {
      await addRole({ data: { userId: String(form.get("userId")), role: String(form.get("role")) as (typeof roles)[number] } });
      formElement.reset();
    }, "Role assigned.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  return <section className="control-room min-h-[80svh] bg-muted px-5 pb-24 pt-28 sm:px-10 lg:pt-36">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div><p className="text-xs uppercase tracking-[0.18em] text-burgundy">Restaurant management</p><h1 className="mt-3 text-[clamp(3.4rem,8vw,7.8rem)] leading-[0.84]">Zayqa control room</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Full restaurant access for menu, service, guest enquiries, settings and team roles.</p></div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
          {tabs.map((tab) => <Button key={tab} type="button" variant={active === tab ? "burgundy" : "editorial"} onClick={() => setActive(tab)}>{tab}</Button>)}
          <Button type="button" variant="ghost" onClick={signOut}><LogOut/>Sign out</Button>
        </div>
      </div>
      {error && <div className="mt-10 border-y border-border py-8 text-lg">{error}</div>}
      {!data && !error && <p className="mt-10">Loading today’s service…</p>}
      {message && <p role="status" className="mt-8 border-y border-border py-4 text-burgundy">{message}</p>}
      {data && <div className="mt-12">
        {active === "menu" && <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-10">{groupedMenu.map(({ category, items }) => <section key={category.id}>
            <div className="mb-4 flex items-end justify-between gap-4"><h2 className="text-5xl">{category.name}</h2><span className="text-xs uppercase text-muted-foreground">{items.length} dishes</span></div>
            <div className="divide-y divide-border border-y border-border">{items.map((item) => <article key={item.id} className="grid gap-4 py-5 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center">
              <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover md:w-30"/>
              <div><div className="flex flex-wrap items-center gap-3"><h3 className="text-3xl">{item.name}</h3><span className="text-sm">{money(item.price)}</span><span className="text-xs uppercase text-muted-foreground">{item.available ? "Available" : "Hidden"}</span>{item.featured && <span className="text-xs uppercase text-burgundy">Featured</span>}</div><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p></div>
              <div className="flex gap-2 md:justify-end"><Button type="button" variant="editorial" onClick={() => setEditingDish(toEditable(item))}><Edit3/>Edit</Button><Button type="button" variant="destructive" size="icon" disabled={busy} onClick={() => removeDish(item)} aria-label={`Remove ${item.name}`}><Trash2/></Button></div>
            </article>)}</div>
          </section>)}</div>
          <DishEditor dish={editingDish} setDish={setEditingDish} submitDish={submitDish} categories={data.categories} busy={busy} onNew={() => setEditingDish(blankDish(data.categories[0]?.id))}/>
        </div>}
        {active === "orders" && <section><h2 className="text-5xl">Orders</h2>
          {!data.orders.length && <p className="mt-6 text-muted-foreground">No orders yet.</p>}
          <div className="mt-6 divide-y divide-border border-y border-border">{data.orders.map((order) => <article key={order.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_auto]">
            <div><p className="text-xs uppercase text-burgundy">#{order.reference} · {pretty(order.fulfilment)}{order.requested_time ? ` · ${order.requested_time}` : ""}</p><h3 className="mt-1 text-3xl">{order.customer_name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{order.phone} · {money(Number(order.total))}{order.address ? ` · ${order.address}` : ""}</p>{order.instructions && <p className="mt-1 text-sm leading-6">“{order.instructions}”</p>}</div>
            <select value={order.status} disabled={busy} onChange={(event) => { const status = event.target.value as (typeof orderStatuses)[number]; void run(() => setOrderStatus({ data: { id: order.id, status } })); }} className="h-11 border border-input bg-background px-3 text-sm uppercase">{orderStatuses.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select>
          </article>)}</div>
        </section>}
        {active === "reservations" && <section><h2 className="text-5xl">Reservations</h2>
          {!data.reservations.length && <p className="mt-6 text-muted-foreground">No reservations yet.</p>}
          <div className="mt-6 divide-y divide-border border-y border-border">{data.reservations.map((reservation) => <article key={reservation.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_auto]">
            <div><p className="text-xs uppercase text-burgundy">{reservation.reference} · {reservation.reservation_date} · {formatTime(String(reservation.reservation_time))}</p><h3 className="mt-1 text-3xl">{reservation.guest_name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{reservation.email} · {reservation.phone} · {reservation.guests} guests</p>{reservation.notes && <p className="mt-1 text-sm leading-6">“{reservation.notes}”</p>}</div>
            <select value={reservation.status} disabled={busy} onChange={(event) => { const status = event.target.value as (typeof reservationStatuses)[number]; void run(() => setReservationStatus({ data: { id: reservation.id, status } })); }} className="h-11 border border-input bg-background px-3 text-sm uppercase">{reservationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          </article>)}</div>
        </section>}
        {active === "enquiries" && <section><h2 className="text-5xl">Enquiries</h2>
          {!data.enquiries.length && <p className="mt-6 text-muted-foreground">No enquiries yet.</p>}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">{data.enquiries.map((enquiry) => <article key={enquiry.id} className="premium-card border border-border bg-card p-5">
            <div className="flex justify-between gap-4"><p className="text-xs uppercase text-burgundy">{pretty(enquiry.kind)}</p><Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => { if (confirm(`Remove the enquiry from ${enquiry.name}?`)) void run(() => deleteEnquiry({ data: { id: enquiry.id } }), "Enquiry removed."); }} aria-label={`Remove enquiry from ${enquiry.name}`}><Trash2/></Button></div>
            <h3 className="mt-2 text-3xl">{enquiry.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{enquiry.email} · {enquiry.phone ?? "No phone"}</p>
            {enquiry.event_date && <p className="text-sm leading-6 text-muted-foreground">{enquiry.event_date}{enquiry.guests ? ` · ${enquiry.guests} guests` : ""}{enquiry.occasion ? ` · ${enquiry.occasion}` : ""}</p>}
            <p className="mt-4 text-sm leading-6">{enquiry.message}</p>
          </article>)}</div>
        </section>}
        {active === "settings" && <form key={data.settings.updated_at} onSubmit={submitSettings} className="grid gap-5 lg:grid-cols-2">
          <h2 className="text-5xl lg:col-span-2">Restaurant details</h2>
          <AdminField label="Name" name="name" defaultValue={data.settings.name}/>
          <AdminField label="Tagline" name="tagline" defaultValue={data.settings.tagline}/>
          <AdminField label="Secondary phrase" name="secondaryPhrase" defaultValue={data.settings.secondary_phrase}/>
          <AdminField label="Phone" name="phone" defaultValue={data.settings.phone}/>
          <AdminField label="Email" name="email" type="email" defaultValue={data.settings.email}/>
          <AdminField label="Hours" name="hours" defaultValue={data.settings.hours}/>
          <div className="lg:col-span-2"><Label htmlFor="address">Address</Label><Textarea id="address" name="address" defaultValue={data.settings.address} className="mt-2 min-h-28 rounded-none" required/></div>
          <Button variant="burgundy" size="lg" disabled={busy} className="lg:col-span-2 lg:justify-self-start">Save restaurant details</Button>
        </form>}
        {active === "roles" && <section>
          <div className="flex items-center gap-3"><ShieldCheck className="text-burgundy"/><h2 className="text-5xl">Team access</h2></div>
          <form onSubmit={submitRole} className="mt-6 grid gap-3 border-y border-border py-6 lg:grid-cols-[1fr_220px_auto]">
            <select name="userId" required aria-label="Team member" className="h-11 border border-input bg-background px-3 text-sm">{data.users.map((user) => <option key={user.id} value={user.id}>{user.email || user.id}</option>)}</select>
            <select name="role" required aria-label="Role" className="h-11 border border-input bg-background px-3 text-sm uppercase">{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select>
            <Button variant="burgundy" disabled={busy}><Plus/>Assign role</Button>
          </form>
          <div className="mt-6 divide-y divide-border border-y border-border">{data.roles.map((role) => <div key={role.id} className="grid grid-cols-[1fr_auto] items-center gap-4 py-4">
            <div><p className="text-sm">{data.users.find((user) => user.id === role.user_id)?.email || role.user_id}</p><p className="text-xs uppercase text-muted-foreground">{role.role}</p></div>
            <Button variant="ghost" size="icon" disabled={busy} onClick={() => { if (confirm(`Remove the ${role.role} role?`)) void run(() => deleteRole({ data: { id: role.id } }), "Role removed."); }} aria-label="Remove role"><Trash2/></Button>
          </div>)}</div>
        </section>}
      </div>}
    </div>
  </section>;
}

function DishEditor({ dish, setDish, submitDish, categories, busy, onNew }: { dish: EditableDish; setDish: (dish: EditableDish) => void; submitDish: (event: FormEvent<HTMLFormElement>) => void; categories: Overview["categories"]; busy: boolean; onNew: () => void }) {
  return <form onSubmit={submitDish} className="premium-card self-start border border-border bg-card p-5 xl:sticky xl:top-24">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-burgundy">Dish editor</p><h2 className="mt-2 text-4xl">{dish.id ? "Edit dish" : "Add dish"}</h2></div><Button type="button" variant="editorial" onClick={onNew}><Plus/>New</Button></div>
    <div className="mt-6 grid gap-4">
      <AdminField label="Dish name" name="dish-name" value={dish.name} onChange={(value) => setDish({ ...dish, name: value })}/>
      <AdminField label="Slug" name="dish-slug" value={dish.slug} onChange={(value) => setDish({ ...dish, slug: value })}/>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="dish-category">Category</Label><select id="dish-category" value={dish.categoryId} required onChange={(event) => setDish({ ...dish, categoryId: event.target.value })} className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
        <div><Label htmlFor="dish-image">Image</Label><select id="dish-image" value={dish.imageUrl ? UPLOADED : dish.imageKey} onChange={(event) => { if (event.target.value !== UPLOADED) setDish({ ...dish, imageKey: event.target.value as MenuImageKey, imageUrl: null }); }} className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm">{dish.imageUrl && <option value={UPLOADED}>uploaded photo</option>}{Object.keys(menuImageKeys).map((key) => <option key={key} value={key}>{key}</option>)}</select></div>
      </div>
      <AdminField label="Price" name="dish-price" type="number" value={dish.price} onChange={(value) => setDish({ ...dish, price: value })}/>
      <div><Label htmlFor="dish-description">Description</Label><Textarea id="dish-description" value={dish.description} onChange={(event) => setDish({ ...dish, description: event.target.value })} className="mt-2 min-h-28 rounded-none" required/></div>
      <AdminField label="Ingredients" name="dish-ingredients" value={dish.ingredients} onChange={(value) => setDish({ ...dish, ingredients: value })} required={false}/>
      <AdminField label="Allergens" name="dish-allergens" value={dish.allergens} onChange={(value) => setDish({ ...dish, allergens: value })} required={false}/>
      <AdminField label="Dietary" name="dish-dietary" value={dish.dietary} onChange={(value) => setDish({ ...dish, dietary: value })} required={false}/>
      <div className="grid grid-cols-2 gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={dish.featured} onChange={(event) => setDish({ ...dish, featured: event.target.checked })}/> Featured</label><label className="flex items-center gap-2"><input type="checkbox" checked={dish.available} onChange={(event) => setDish({ ...dish, available: event.target.checked })}/> Available</label></div>
      <Button variant="burgundy" size="lg" disabled={busy}>{busy ? "Saving…" : "Save dish"}</Button>
    </div>
  </form>;
}

function AdminField({ label, name, type = "text", defaultValue, value, required = true, onChange }: { label: string; name: string; type?: string; defaultValue?: string | number; value?: string; required?: boolean; onChange?: (value: string) => void }) {
  return <div><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} step={type === "number" ? "0.01" : undefined} min={type === "number" ? 0 : undefined} defaultValue={defaultValue} value={value} required={required} onChange={onChange ? (event) => onChange(event.target.value) : undefined} className="mt-2 rounded-none"/></div>;
}

function splitList(value: string) {
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}
