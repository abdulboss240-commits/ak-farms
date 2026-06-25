import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatPKR } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResetSectionButton } from "@/components/ResetSectionButton";
import { toast } from "sonner";

type OrderStatus = Database["public"]["Enums"]["order_status"];
const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Status updated.");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed."),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Orders</h1>
          <p className="mt-1 text-muted-foreground">Review and update delivery status.</p>
        </div>
        <ResetSectionButton section="orders" label="Orders" invalidateKeys={[["admin-orders"], ["admin-stats"]]} />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((o) => {
              const open = expanded === o.id;
              return (
                <li key={o.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setExpanded(open ? null : o.id)}
                      className="flex flex-1 items-center gap-3 text-start"
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
                      <div className="flex-1">
                        <div className="font-mono text-sm font-semibold">{o.order_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.full_name} · {o.city} · {new Date(o.created_at).toLocaleString()}
                        </div>
                      </div>
                    </button>
                    <span className="text-sm font-medium">{formatPKR(Number(o.total))}</span>
                    <Select value={o.status} onValueChange={(v) => updateMut.mutate({ id: o.id, status: v as OrderStatus })}>
                      <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {open && (
                    <div className="mt-4 grid gap-4 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Contact</p>
                        <p className="mt-1">{o.email}</p>
                        <p>{o.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Delivery</p>
                        <p className="mt-1">{o.street}, {o.city}</p>
                        <p>Date: {o.delivery_date} · {o.payment_method.toUpperCase()}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Items</p>
                        <ul className="mt-2 space-y-2">
                          {o.order_items.map((i) => (
                            <li key={i.id} className="flex items-center gap-3">
                              {i.image && <img src={i.image} alt="" className="h-10 w-10 rounded object-cover" />}
                              <span className="flex-1">{i.name} ({i.breed}) × {i.qty}</span>
                              <span className="font-medium">{formatPKR(Number(i.unit_price) * i.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
