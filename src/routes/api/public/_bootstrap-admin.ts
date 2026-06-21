import { createFileRoute } from "@tanstack/react-router";

// One-shot bootstrap to create the primary admin account. Idempotent.
// This file is intended to be removed after first successful call.
export const Route = createFileRoute("/api/public/_bootstrap-admin")({
  server: {
    handlers: {
      GET: async () => {
        const email = "aatika@gmail.com";
        const password = "~!@#$%^&*()_++";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let userId: string | null = null;
        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (listErr) return Response.json({ ok: false, step: "list", error: listErr.message }, { status: 500 });
        const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (existing) {
          userId = existing.id;
          // Reset password to the requested value to ensure it matches
          await supabaseAdmin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
        } else {
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: "Aatika (Admin)" },
          });
          if (createErr) return Response.json({ ok: false, step: "create", error: createErr.message }, { status: 500 });
          userId = created.user!.id;
        }

        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
        if (roleErr) return Response.json({ ok: false, step: "role", error: roleErr.message }, { status: 500 });

        return Response.json({ ok: true, userId, email });
      },
    },
  },
});
