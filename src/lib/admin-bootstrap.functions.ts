import { createServerFn } from "@tanstack/react-start";

// One-shot, idempotent bootstrap for the primary admin account.
// Safe to call multiple times: creates the user if missing, then ensures admin role.
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const email = "aatika@gmail.com";
  const password = "~!@#$%^&*()_++";

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Find or create the user
  let userId: string | null = null;

  // listUsers is paginated; search by email via filter
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Aatika (Admin)" },
    });
    if (createErr) throw createErr;
    userId = created.user!.id;
  }

  // Ensure admin role
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw roleErr;

  return { ok: true, userId, email };
});
