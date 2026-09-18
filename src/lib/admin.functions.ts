import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AdminContext = { supabase: any; userId: string };

async function assertAdmin(context: AdminContext) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as AdminContext);
    const { supabase } = context as AdminContext;
    const [orders, orderItems, reservations, enquiries, items, categories] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("order_items").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("reservations").select("*").order("reservation_date", { ascending: true }).limit(100),
      supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("menu_items").select("*").order("name"),
      supabase.from("menu_categories").select("*").order("sort_order"),
    ]);
    const err = orders.error || orderItems.error || reservations.error || enquiries.error || items.error || categories.error;
    if (err) throw new Error(err.message);
    return {
      orders: orders.data ?? [],
      orderItems: orderItems.data ?? [],
      reservations: reservations.data ?? [],
      enquiries: enquiries.data ?? [],
      menuItems: items.data ?? [],
      categories: categories.data ?? [],
    };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(["received", "confirmed", "preparing", "ready", "on_the_way", "completed", "cancelled"]) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminContext);
    const { error } = await (context as AdminContext).supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(["pending", "confirmed", "cancelled", "completed"]) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminContext);
    const { error } = await (context as AdminContext).supabase.from("reservations").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateEnquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(["new", "in_progress", "resolved"]) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminContext);
    const { error } = await (context as AdminContext).supabase.from("enquiries").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const menuItemSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.number().positive(),
  image_key: z.string().nullable().optional(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()),
  dietary: z.array(z.string()),
  add_ons: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })),
  is_featured: z.boolean(),
  is_available: z.boolean(),
});

export const upsertMenuItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => menuItemSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminContext);
    const { id, ...row } = data;
    const supabase = (context as AdminContext).supabase;
    const { error } = id
      ? await supabase.from("menu_items").update(row).eq("id", id)
      : await supabase.from("menu_items").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMenuItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminContext);
    const { error } = await (context as AdminContext).supabase.from("menu_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
