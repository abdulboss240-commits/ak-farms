import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth", search: { next: "/admin" } });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit space-y-1 rounded-2xl border border-border/60 bg-card p-3 shadow-soft">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" exact />
          <NavItem to="/admin/goats" icon={Package} label="Products" />
          <NavItem to="/admin/orders" icon={ShoppingBag} label="Orders" />
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, exact }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-muted/60 hover:text-foreground"
      activeProps={{ className: "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary bg-primary/10" }}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
