import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Truck, Package } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/order/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} — Premium Goats` },
      { name: "description", content: "Your order has been received. Track delivery status here." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

interface OrderData {
  id: string;
  fullName: string;
  city: string;
  date: string;
  payment: "online" | "cod";
  items: Array<{ id: string; name: string; breed: string; price: number; qty: number; image: string }>;
  subtotal: number;
  fee: number;
  total: number;
}

function OrderPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(`order.${id}`);
    if (raw) setOrder(JSON.parse(raw));
  }, [id]);

  const steps = [
    { key: "pending", label: t("order.status.pending"), icon: Circle, done: true },
    { key: "confirmed", label: t("order.status.confirmed"), icon: CheckCircle2, done: true },
    { key: "outForDelivery", label: t("order.status.outForDelivery"), icon: Truck, done: false },
    { key: "delivered", label: t("order.status.delivered"), icon: Package, done: false },
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
          <div><dt className="text-muted-foreground">{t("order.id")}</dt><dd className="mt-0.5 font-mono font-semibold">{id}</dd></div>
          {order && (
            <>
              <div><dt className="text-muted-foreground">{t("checkout.fullName")}</dt><dd className="mt-0.5">{order.fullName}</dd></div>
              <div><dt className="text-muted-foreground">{t("checkout.city")}</dt><dd className="mt-0.5">{order.city}</dd></div>
              <div><dt className="text-muted-foreground">{t("checkout.date")}</dt><dd className="mt-0.5">{order.date}</dd></div>
              <div><dt className="text-muted-foreground">{t("checkout.payment")}</dt><dd className="mt-0.5">{order.payment === "online" ? t("checkout.online") : t("checkout.cod")}</dd></div>
              <div><dt className="text-muted-foreground">{t("cart.total")}</dt><dd className="mt-0.5 font-display text-lg text-primary">{formatPKR(order.total)}</dd></div>
            </>
          )}
        </dl>

        <div className="mt-8">
          <h2 className="font-display text-xl">{t("order.tracking")}</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <li key={s.key} className="flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.done ? "text-success" : "text-muted-foreground"}`} />
                <span className={`text-sm ${s.done ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {i + 1}. {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {order && order.items && (
          <div className="mt-8">
            <h2 className="font-display text-xl">{t("checkout.summary")}</h2>
            <ul className="mt-3 divide-y divide-border">
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-3 py-3">
                  <img src={i.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{i.name} × {i.qty}</div>
                    <div className="text-xs text-muted-foreground">{i.breed}</div>
                  </div>
                  <div className="text-sm font-medium">{formatPKR(i.price * i.qty)}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button asChild className="mt-8 rounded-full"><Link to="/goats">{t("cart.continue")}</Link></Button>
      </div>
    </div>
  );
}
