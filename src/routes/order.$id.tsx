import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Truck, Package, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/order/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id.slice(0, 8)} — Premium Goats` },
      { name: "description", content: "Your order has been received. Track delivery status here." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

async function fetchOrder(id: string) {
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!order) return null;
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  return { ...order, items: items ?? [] };
}

function OrderPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const { data: order, isLoading } = useQuery({ queryKey: ["order", id], queryFn: () => fetchOrder(id) });

  if (isLoading) {
    return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-3xl">Order not found</h1>
        <p className="mt-3 text-muted-foreground">You may need to sign in to view this order.</p>
        <Button asChild className="mt-6 rounded-full"><Link to="/goats">{t("cart.continue")}</Link></Button>
      </div>
    );
  }

  const statusIdx = ["pending", "confirmed", "shipped", "delivered"].indexOf(order.status);
  const steps = [
    { key: "pending", label: t("order.status.pending"), icon: Circle },
    { key: "confirmed", label: t("order.status.confirmed"), icon: CheckCircle2 },
    { key: "shipped", label: t("order.status.outForDelivery"), icon: Truck },
    { key: "delivered", label: t("order.status.delivered"), icon: Package },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl">{t("order.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("order.subtitle")}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 rounded-2xl bg-muted/50 p-5 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">{t("order.id")}</dt><dd className="mt-0.5 font-mono font-semibold">{order.order_number}</dd></div>
          <div><dt className="text-muted-foreground">{t("checkout.fullName")}</dt><dd className="mt-0.5">{order.full_name}</dd></div>
          <div><dt className="text-muted-foreground">{t("checkout.city")}</dt><dd className="mt-0.5">{order.city}</dd></div>
          <div><dt className="text-muted-foreground">{t("checkout.date")}</dt><dd className="mt-0.5">{order.delivery_date}</dd></div>
          <div><dt className="text-muted-foreground">{t("checkout.payment")}</dt><dd className="mt-0.5">{order.payment_method === "online" ? t("checkout.online") : t("checkout.cod")}</dd></div>
          <div><dt className="text-muted-foreground">{t("cart.total")}</dt><dd className="mt-0.5 font-display text-lg text-primary">{formatPKR(Number(order.total))}</dd></div>
        </dl>

        <div className="mt-8">
          <h2 className="font-display text-xl">{t("order.tracking")}</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => {
              const done = i <= statusIdx;
              return (
                <li key={s.key} className="flex items-center gap-3">
                  <s.icon className={`h-5 w-5 ${done ? "text-success" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {i + 1}. {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-xl">{t("checkout.summary")}</h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                {i.image && <img src={i.image} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <div className="flex-1 text-sm">
                  <div className="font-medium">{i.name} × {i.qty}</div>
                  <div className="text-xs text-muted-foreground">{i.breed}</div>
                </div>
                <div className="text-sm font-medium">{formatPKR(Number(i.unit_price) * i.qty)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="rounded-full"><Link to="/goats">{t("cart.continue")}</Link></Button>
          <Button asChild variant="outline" className="rounded-full"><Link to="/account">My orders</Link></Button>
        </div>
      </div>
    </div>
  );
}
