import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPKR } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My account — Premium Goats" }, { name: "robots", content: "noindex" }] }),
  component: Account,
});

function Account() {
  const { user, signOut } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">My account</h1>
          <p className="mt-2 text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={signOut} className="rounded-full">Sign out</Button>
      </div>

      <h2 className="mt-12 font-display text-2xl">My orders</h2>

      {isLoading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/goats">Browse goats</Link></Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <div>
                <Link to="/order/$id" params={{ id: o.id }} className="font-mono font-semibold hover:text-primary">{o.order_number}</Link>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase">{o.status}</span>
                <span className="font-display text-lg text-primary">{formatPKR(Number(o.total))}</span>
                <Button asChild size="sm" variant="ghost"><Link to="/order/$id" params={{ id: o.id }}>View</Link></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
