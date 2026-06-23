import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { GoatImage } from "@/components/GoatImage";
import { formatPKR, deliveryFee } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Premium Goats" },
      { name: "description", content: "Review items in your cart and proceed to secure checkout." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { t } = useI18n();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const fee = items.length ? deliveryFee("Lahore", subtotal) : 0;
  const total = subtotal + fee;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl">{t("cart.title")}</h1>

      {items.length === 0 ? (
        <div className="mt-16 grid place-items-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-24 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">{t("cart.empty")}</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/goats">{t("cart.continue")}</Link></Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.id} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
                <GoatImage path={i.image} alt={i.name} className="h-24 w-24 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link to="/goats/$id" params={{ id: i.id }} className="font-display text-xl hover:text-primary">{i.name}</Link>
                      <p className="text-sm text-muted-foreground">{i.breed}</p>
                    </div>
                    <p className="font-display text-xl text-primary">{formatPKR(i.price * i.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full" onClick={() => setQty(i.id, i.qty - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{i.qty}</span>
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full" onClick={() => setQty(i.id, i.qty + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="me-1 h-4 w-4" /> {t("cart.remove")}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <h2 className="font-display text-2xl">{t("checkout.summary")}</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label={t("cart.subtotal")} value={formatPKR(subtotal)} />
              <Row label={t("cart.delivery")} value={fee === 0 ? "Free" : formatPKR(fee)} />
              <div className="my-3 h-px bg-border" />
              <Row label={t("cart.total")} value={formatPKR(total)} bold />
            </dl>
            <Button asChild size="lg" className="mt-6 h-12 w-full rounded-full">
              <Link to="/checkout">{t("cart.checkout")}</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold text-foreground" : "text-muted-foreground"}`}>
      <dt>{label}</dt>
      <dd className={bold ? "font-display text-xl text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}
