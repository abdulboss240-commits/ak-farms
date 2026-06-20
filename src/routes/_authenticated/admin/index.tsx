import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/format";
import { Package, ShoppingBag, DollarSign, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin dashboard — Premium Goats" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: goatsCount }, { count: availableCount }, { data: orders, count: ordersCount }] = await Promise.all([
        supabase.from("goats").select("*", { count: "exact", head: true }),
        supabase.from("goats").select("*", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("orders").select("total, status", { count: "exact" }),
      ]);
      const revenue = (orders ?? []).reduce((s, o) => s + Number(o.total), 0);
      const pending = (orders ?? []).filter((o) => o.status === "pending").length;
      return { goatsCount: goatsCount ?? 0, availableCount: availableCount ?? 0, ordersCount: ordersCount ?? 0, revenue, pending };
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Quick overview of your store.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Package} label="Total goats" value={data?.goatsCount ?? "—"} />
        <Stat icon={Package} label="Available" value={data?.availableCount ?? "—"} />
        <Stat icon={ShoppingBag} label="Orders" value={data?.ordersCount ?? "—"} sub={data ? `${data.pending} pending` : ""} />
        <Stat icon={DollarSign} label="Revenue" value={data ? formatPKR(data.revenue) : "—"} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/goats" className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-shadow hover:shadow-warm">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-display text-xl">Manage products</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, or remove goats from your catalog.</p>
        </Link>
        <Link to="/admin/orders" className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-shadow hover:shadow-warm">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-display text-xl">Manage orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">Review orders and update delivery status.</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
