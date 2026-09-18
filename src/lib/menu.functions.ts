import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { images, type CategorySlug, type Dish } from "./zayqa-data";

export type MenuDish = Dish & { featured: boolean };
export type MenuCategoryInfo = { slug: CategorySlug; name: string; intro: string };
export type PublicMenu = { categories: MenuCategoryInfo[]; dishes: MenuDish[] };

export const getPublicMenu = createServerFn({ method: "GET" }).handler(async (): Promise<PublicMenu> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const [{ data: cats, error: catErr }, { data: items, error: itemErr }] = await Promise.all([
    supabase.from("menu_categories").select("slug, name, description, sort_order").eq("is_available", true).order("sort_order"),
    supabase.from("menu_items").select("slug, name, description, price, image_key, ingredients, allergens, dietary, add_ons, is_featured, category_id").eq("is_available", true),
  ]);
  if (catErr) throw new Error(catErr.message);
  if (itemErr) throw new Error(itemErr.message);
  const catIdToSlug = new Map<string, string>();
  // category slug lookup needs ids; refetch with ids
  const { data: catIds } = await supabase.from("menu_categories").select("id, slug");
  for (const c of catIds ?? []) catIdToSlug.set(c.id, c.slug);
  const categories: MenuCategoryInfo[] = (cats ?? []).map((c) => ({
    slug: c.slug as CategorySlug,
    name: c.name,
    intro: c.description ?? "",
  }));
  const dishes: MenuDish[] = (items ?? []).map((i) => ({
    slug: i.slug,
    category: (catIdToSlug.get(i.category_id) ?? "mains") as CategorySlug,
    name: i.name,
    description: i.description,
    longDescription: i.description,
    price: Number(i.price),
    image: images[(i.image_key as keyof typeof images) ?? "table"] ?? images.table,
    ingredients: i.ingredients ?? [],
    allergens: i.allergens ?? [],
    dietary: i.dietary ?? [],
    addOns: (i.add_ons as { name: string; price: number }[]) ?? [],
    featured: i.is_featured,
  }));
  return { categories, dishes };
});
