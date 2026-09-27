import { createServerFn } from "@tanstack/react-start";
import { DEMO_ADMIN } from "./demo-admin";

/**
 * Makes sure the public demo owner account exists, has the demo password and holds the admin role.
 * Roles can only be written with the service role key, so this has to run on the server.
 * It only ever touches the fixed demo account, whose credentials are already public.
 */
export const ensureDemoAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const created = await supabaseAdmin.auth.admin.createUser({
    email: DEMO_ADMIN.email,
    password: DEMO_ADMIN.password,
    email_confirm: true,
    user_metadata: { full_name: "Zayqa Demo Owner" },
  });

  let userId = created.data.user?.id;
  if (!userId) {
    for (let page = 1; !userId; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error(error.message);
      userId = data.users.find((u) => u.email?.toLowerCase() === DEMO_ADMIN.email)?.id;
      if (data.users.length < 1000) break;
    }
    if (!userId) throw new Error(created.error?.message ?? "Could not find the demo owner account.");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: DEMO_ADMIN.password, email_confirm: true });
    if (error) throw new Error(error.message);
  }

  const { error } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
  if (error) throw new Error(error.message);

  return { ok: true };
});
