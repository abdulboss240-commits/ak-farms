import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHash, timingSafeEqual } from "node:crypto";

type Section = "goats" | "orders";

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const resetAdminSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { section: Section; password: string }) => {
    if (data.section !== "goats" && data.section !== "orders") {
      throw new Error("Invalid section");
    }
    if (typeof data.password !== "string" || data.password.length === 0) {
      throw new Error("Password required");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    // Must be admin
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error("Authorization check failed");
    if (!isAdmin) throw new Error("Forbidden");

    const expected = process.env.ADMIN_RESET_PASSWORD;
    if (!expected) throw new Error("Reset password not configured");
    if (!passwordMatches(data.password, expected)) {
      return { ok: false as const, error: "Incorrect password" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.section === "goats") {
      // Remove uploaded images (skip seed/), then delete rows
      const { data: rows } = await supabaseAdmin.from("goats").select("images");
      const paths = (rows ?? [])
        .flatMap((r) => (r.images as string[] | null) ?? [])
        .filter((p) => p && !p.startsWith("seed/") && !p.startsWith("http"));
      if (paths.length) {
        await supabaseAdmin.storage.from("goat-images").remove(paths);
      }
      const { error } = await supabaseAdmin.from("goats").delete().not("id", "is", null);
      if (error) throw new Error(error.message);
      return { ok: true as const, deleted: rows?.length ?? 0 };
    }

    // orders
    await supabaseAdmin.from("order_items").delete().not("id", "is", null);
    const { error } = await supabaseAdmin.from("orders").delete().not("id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
