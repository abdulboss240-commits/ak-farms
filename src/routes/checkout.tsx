import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPKR, deliveryFee, PAKISTAN_CITIES } from "@/lib/format";
import { GoatImage } from "@/components/GoatImage";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Premium Goats" },
      { name: "description", content: "Secure checkout with online card payment or cash on delivery." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  street: z.string().trim().min(3).max(200),
  city: z.string().min(1),
  date: z.string().min(1),
  payment: z.enum(["online", "cod"]),
});

function Checkout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [city, setCity] = useState("Lahore");
  const [payment, setPayment] = useState<"online" | "cod">("cod");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const fee = deliveryFee(city, subtotal);
  const total = subtotal + fee;

  if (loading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-3xl">Sign in to checkout</h1>
        <p className="mt-3 text-muted-foreground">Create a free account or sign in to place your order securely.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/auth" search={{ next: "/checkout" }}>Sign in / Sign up</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-3xl">{t("cart.empty")}</h1>
        <Button asChild className="mt-6 rounded-full"><Link to="/goats">{t("cart.continue")}</Link></Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      street: fd.get("street"),
      city,
      date: fd.get("date"),
      payment,
    });
    if (!parsed.success) {
      toast.error("Please check the form fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          full_name: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          street: parsed.data.street,
          city: parsed.data.city,
          delivery_date: parsed.data.date,
          payment_method: parsed.data.payment,
          subtotal,
          delivery_fee: fee,
          total,
        })
        .select()
        .single();
      if (error) throw error;

      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        goat_id: i.id,
        name: i.name,
        breed: i.breed,
        image: i.image,
        unit_price: i.price,
        qty: i.qty,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsErr) throw itemsErr;

      // Mark goats as reserved
      await supabase.from("goats").update({ status: "reserved" }).in("id", items.map((i) => i.id));

      clear();
      toast.success("Order placed!");
      navigate({ to: "/order/$id", params: { id: order.id } });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl">{t("checkout.title")}</h1>

      <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Section title={t("checkout.contact")}>
            <Field name="fullName" label={t("checkout.fullName")} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="email" label={t("checkout.email")} type="email" defaultValue={user.email ?? ""} required />
              <Field name="phone" label={t("checkout.phone")} type="tel" required />
            </div>
          </Section>

          <Section title={t("checkout.address")}>
            <Field name="street" label={t("checkout.street")} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-sm">{t("checkout.city")}</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAKISTAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Field name="date" label={t("checkout.date")} type="date" required />
            </div>
          </Section>

          <Section title={t("checkout.payment")}>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as "online" | "cod")} className="grid gap-3 sm:grid-cols-2">
              <label className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-colors ${payment === "online" ? "border-primary bg-primary/5" : "border-border"}`}>
                <RadioGroupItem value="online" />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    {t("checkout.online")}
                    <span className="inline-flex items-center rounded-md bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                      COMING SOON
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Card payment unavailable right now</div>
                </div>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-colors ${payment === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
                <RadioGroupItem value="cod" />
                <div>
                  <div className="font-medium">{t("checkout.cod")}</div>
                  <div className="text-xs text-muted-foreground">Pay when delivered</div>
                </div>
              </label>
            </RadioGroup>
          </Section>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl">{t("checkout.summary")}</h2>
          <ul className="divide-y divide-border">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <GoatImage path={i.image} alt={i.name} className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex flex-1 flex-col text-sm">
                  <span className="font-medium">{i.name} <span className="text-muted-foreground">× {i.qty}</span></span>
                  <span className="text-xs text-muted-foreground">{i.breed}</span>
                </div>
                <span className="text-sm font-medium">{formatPKR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><dt>{t("cart.subtotal")}</dt><dd className="text-foreground">{formatPKR(subtotal)}</dd></div>
            <div className="flex justify-between text-muted-foreground"><dt>{t("cart.delivery")}</dt><dd className="text-foreground">{fee === 0 ? "Free" : formatPKR(fee)}</dd></div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>{t("cart.total")}</dt><dd className="font-display text-xl text-primary">{formatPKR(total)}</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" disabled={submitting} className="h-12 w-full rounded-full">
            {submitting ? "Placing…" : t("checkout.place")}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ name, label, type = "text", required, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5 block text-sm">{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} className="h-11" />
    </div>
  );
}
