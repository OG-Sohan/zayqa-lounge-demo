import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { images, restaurant } from "@/lib/zayqa-data";

type Ctx = { supabase: SupabaseClient<Database>; userId: string; claims: { email?: string } };
type MenuRow = Database["public"]["Tables"]["menu_items"]["Row"];

export const menuImageKeys = images;
export type MenuImageKey = keyof typeof images;
export type ManagedDish = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  dietary: string;
  price: number;
  image: string;
  imageKey: MenuImageKey;
  imageUrl: string | null;
  featured: boolean;
  available: boolean;
};

const imageKeySchema = z.enum(Object.keys(images) as [MenuImageKey, ...MenuImageKey[]]);
const orderStatusSchema = z.enum(["received", "confirmed", "preparing", "ready", "on_the_way", "completed", "cancelled"]);
const reservationStatusSchema = z.enum(["pending", "confirmed", "cancelled", "completed"]);
const roleSchema = z.enum(["admin", "staff", "customer", "manager", "superadmin"]);
const MANAGEMENT_ROLES = ["admin", "superadmin", "manager"];

const menuItemSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(120),
  categoryId: z.string().uuid(),
  description: z.string().trim().min(4).max(600),
  ingredients: z.array(z.string().trim().min(1).max(80)).max(20),
  allergens: z.array(z.string().trim().min(1).max(80)).max(20),
  dietary: z.string().trim().max(120).optional(),
  price: z.number().min(0).max(500),
  imageKey: imageKeySchema,
  imageUrl: z.string().max(500).nullable(),
  featured: z.boolean(),
  available: z.boolean(),
});

const settingsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(180),
  secondaryPhrase: z.string().trim().min(2).max(180),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(255),
  address: z.string().trim().min(5).max(300),
  hours: z.string().trim().min(3).max(120),
});

const splitList = (value: string | undefined) => (value ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);

export function rowToDish(row: MenuRow): ManagedDish {
  const parsedImageKey = imageKeySchema.safeParse(row.image_key);
  const imageKey = parsedImageKey.success ? parsedImageKey.data : "table";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    description: row.description,
    ingredients: row.ingredients ?? [],
    allergens: row.allergens ?? [],
    dietary: (row.dietary ?? []).join(", "),
    price: Number(row.price),
    image: row.image_url ?? images[imageKey],
    imageKey,
    imageUrl: row.image_url,
    featured: row.is_featured,
    available: row.is_available,
  };
}

// Roles are read in full and checked here: filtering on enum values the database may not have yet would error.
async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  if (error || !data?.some((row) => MANAGEMENT_ROLES.includes(row.role))) throw new Error("Forbidden");
}

async function listUsers(context: Ctx, roles: { user_id: string }[]) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (error) throw error;
    return data.users.map((user) => ({ id: user.id, email: user.email ?? "", createdAt: user.created_at }));
  } catch {
    const ids = [...new Set([context.userId, ...roles.map((role) => role.user_id)])];
    return ids.map((id) => ({ id, email: id === context.userId ? (context.claims.email ?? "") : "", createdAt: "" }));
  }
}

export const getAccountOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [{ data: orders, error: orderError }, { data: reservations, error: reservationError }] = await Promise.all([
    context.supabase.from("orders").select("reference:order_number, total, status, fulfilment, created_at").eq("user_id", context.userId).order("created_at", { ascending: false }),
    context.supabase.from("reservations").select("reference:confirmation_code, reservation_date, reservation_time, guests, status").eq("user_id", context.userId).order("reservation_date", { ascending: false }),
  ]);
  if (orderError || reservationError) throw new Error("Could not load your account.");
  return { orders: orders ?? [], reservations: reservations ?? [] };
});

export const getManagementOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const ctx = context as Ctx;
  await assertAdmin(ctx);
  const db = ctx.supabase;
  const [ordersResult, reservationsResult, enquiriesResult, menuResult, categoriesResult, settingsResult, rolesResult] = await Promise.all([
    db.from("orders").select("id,reference:order_number,customer_name,phone,total,status,fulfilment,created_at,requested_time,address,instructions").order("created_at", { ascending: false }).limit(50),
    db.from("reservations").select("id,reference:confirmation_code,guest_name,email,phone,reservation_date,reservation_time,guests,status,notes").order("reservation_date", { ascending: true }).limit(50),
    db.from("enquiries").select("id,kind:enquiry_type,name,email,phone,event_date,guests,occasion,message,created_at").order("created_at", { ascending: false }).limit(50),
    db.from("menu_items").select("*").order("name", { ascending: true }),
    db.from("menu_categories").select("id,slug,name,sort_order").order("sort_order", { ascending: true }),
    db.from("restaurant_settings").select("*").eq("id", "zayqa").maybeSingle(),
    db.from("user_roles").select("id,user_id,role"),
  ]);
  if (ordersResult.error || reservationsResult.error || enquiriesResult.error || menuResult.error || categoriesResult.error || rolesResult.error) throw new Error("Could not load management data.");
  const roles = rolesResult.data ?? [];
  const settings = settingsResult.data ?? {
    id: "zayqa",
    name: restaurant.name,
    tagline: restaurant.tagline,
    secondary_phrase: restaurant.phrase,
    phone: restaurant.phone,
    email: restaurant.email,
    address: restaurant.address,
    hours: restaurant.hours,
    updated_at: "",
  };
  return {
    orders: ordersResult.data ?? [],
    reservations: reservationsResult.data ?? [],
    enquiries: enquiriesResult.data ?? [],
    menuItems: (menuResult.data ?? []).map(rowToDish),
    categories: categoriesResult.data ?? [],
    settings,
    roles,
    users: await listUsers(ctx, roles),
  };
});

export const saveRestaurantSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => settingsSchema.parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const { error } = await context.supabase.from("restaurant_settings").upsert({
    id: "zayqa",
    name: data.name,
    tagline: data.tagline,
    secondary_phrase: data.secondaryPhrase,
    phone: data.phone,
    email: data.email,
    address: data.address,
    hours: data.hours,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error("Could not save restaurant settings.");
  return { ok: true };
});

export const saveManagedMenuItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => menuItemSchema.parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const payload = {
    slug: data.slug,
    name: data.name,
    category_id: data.categoryId,
    description: data.description,
    ingredients: data.ingredients,
    allergens: data.allergens,
    dietary: splitList(data.dietary),
    price: data.price,
    image_key: data.imageKey,
    image_url: data.imageUrl,
    is_featured: data.featured,
    is_available: data.available,
    updated_at: new Date().toISOString(),
  };
  const query = data.id
    ? context.supabase.from("menu_items").update(payload).eq("id", data.id).select("*").single()
    : context.supabase.from("menu_items").insert(payload).select("*").single();
  const { data: row, error } = await query;
  if (error || !row) throw new Error(error?.code === "23505" ? "Another dish already uses that slug." : "Could not save that dish.");
  return rowToDish(row);
});

export const removeManagedMenuItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const { error } = await context.supabase.from("menu_items").delete().eq("id", data.id);
  if (error) throw new Error("Could not remove that dish.");
  return { ok: true };
});

export const updateOrderStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid(), status: orderStatusSchema }).parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
  if (error) throw new Error("Could not update that order.");
  return { ok: true };
});

export const updateReservationStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid(), status: reservationStatusSchema }).parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const { error } = await context.supabase.from("reservations").update({ status: data.status }).eq("id", data.id);
  if (error) throw new Error("Could not update that reservation.");
  return { ok: true };
});

export const removeEnquiry = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const { error } = await context.supabase.from("enquiries").delete().eq("id", data.id);
  if (error) throw new Error("Could not remove that enquiry.");
  return { ok: true };
});

export const assignUserRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ userId: z.string().uuid(), role: roleSchema }).parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const { error } = await context.supabase.from("user_roles").upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
  if (error) throw new Error("Could not assign that role.");
  return { ok: true };
});

export const removeUserRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context as Ctx);
  const { error } = await context.supabase.from("user_roles").delete().eq("id", data.id);
  if (error) throw new Error("Could not remove that role.");
  return { ok: true };
});
