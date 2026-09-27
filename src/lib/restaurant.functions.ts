import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type RestaurantSettings = Database["public"]["Tables"]["restaurant_settings"]["Row"];

export const getRestaurantSettings = createServerFn({ method: "GET" }).handler(async (): Promise<RestaurantSettings | null> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!url || !key) return null;
  const supabase = createClient<Database>(url, key, {
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
  const { data, error } = await supabase.from("restaurant_settings").select("*").eq("id", "zayqa").maybeSingle();
  return error ? null : data;
});
