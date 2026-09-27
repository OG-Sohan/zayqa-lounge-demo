import { createServerFn } from "@tanstack/react-start";

export const DEMO_EMAIL = "demo@grabweb.com";
export const DEMO_PASSWORD = "zayqa2026";

// Ensures the public demo admin account exists with full access.
export const ensureDemoAccount = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let userId: string | undefined;
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);
  if (existing) {
    userId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(existing.id, { password: DEMO_PASSWORD, email_confirm: true });
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true });
    if (error) throw new Error(error.message);
    userId = data.user?.id;
  }
  if (!userId) throw new Error("Demo account unavailable.");
  // Granted one at a time: 'superadmin' only exists once the management migration has run.
  const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "superadmin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
  return { ok: true };
});
