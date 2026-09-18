import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const SITE_CONTENT_DEFAULTS: Record<string, string> = {
  hero_heading_1: "Where flavour",
  hero_heading_2: "meets atmosphere.",
  hero_subtext: "TASTE · CONNECT · UNWIND",
  hero_image: "",
  intro_image: "",
  intro_text:
    "Food that feels generous. A room made for lingering. Service that knows when to arrive and when to let the evening unfold.",
};

export const getSiteContent = createServerFn({ method: "GET" }).handler(async (): Promise<Record<string, string>> => {
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
  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error) throw new Error(error.message);
  const content = { ...SITE_CONTENT_DEFAULTS };
  for (const row of data ?? []) content[row.key] = row.value;
  return content;
});
