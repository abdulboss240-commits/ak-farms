import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Truck, ShieldCheck, MessageCircle, ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { getGoat, goats } from "@/data/goats";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { formatPKR, whatsappLink } from "@/lib/format";
import { GoatCard } from "@/components/GoatCard";
import { toast } from "sonner";

export const Route = createFileRoute("/goats/$id")({
  loader: ({ params }) => {
    const goat = getGoat(params.id);
    if (!goat) throw notFound();
    return { goat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.goat
      ? [
          { title: `${loaderData.goat.name} (${loaderData.goat.breed}) — Premium Goats` },
          { name: "description", content: loaderData.goat.description },
          { property: "og:title", content: `${loaderData.goat.name} — ${loaderData.goat.breed}` },
          { property: "og:description", content: loaderData.goat.description },
          { property: "og:image", content: loaderData.goat.images[0] },
        ]
      : [],
  }),
  component: GoatDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="font-display text-4xl">Goat not found</h1>
      <Button asChild className="mt-6"><Link to="/goats">Back to listings</Link></Button>
    </div>
  ),
  errorComponent: () => <div className="p-8 text-center text-muted-foreground">Could not load this goat.</div>,
});

function GoatDetail() {
  const { goat } = Route.useLoaderData();
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const add = useCart((s) => s.add);

  const related = goats.filter((g) => g.id !== goat.id && g.breed === goat.breed).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/goats" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("nav.goats")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft">
            <img
              src={goat.images[active]}
              alt={goat.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          {goat.images.length > 1 && (
            <div className="flex gap-3">
              {goat.images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-2xl border-2 transition-colors ${i === active ? "border-primary" : "border-transparent hover:border-border"}`}
                >
                  <img src={src} alt="" loading="lazy" className="h-20 w-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">{goat.breed}</p>
          <h1 className="mt-2 font-display text-5xl">{goat.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl text-primary">{formatPKR(goat.price)}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${goat.available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              {goat.available ? t("goat.available") : t("goat.sold")}
            </span>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card p-5 text-sm shadow-soft">
            <Stat label={t("goat.age")} value={`${goat.ageMonths} ${t("goat.months")}`} />
            <Stat label={t("goat.weight")} value={`${goat.weightKg} ${t("goat.kg")}`} />
            <Stat label={t("goat.breed")} value={goat.breed} />
            <Stat label={t("goat.health")} value={t("goat.healthy")} />
          </dl>

          <div className="mt-6">
            <h2 className="font-display text-xl">{t("goat.description")}</h2>
            <p className="mt-2 text-foreground/80 leading-relaxed">{goat.description}</p>
          </div>

          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex items-center gap-2.5 text-foreground/80"><MapPin className="h-4 w-4 text-primary" />{t("goat.farm")}: {goat.farm}</li>
            <li className="flex items-center gap-2.5 text-foreground/80"><Truck className="h-4 w-4 text-primary" />{t("goat.delivery")}: 2–4 days, nationwide</li>
            <li className="flex items-center gap-2.5 text-foreground/80"><ShieldCheck className="h-4 w-4 text-primary" />Health certificate included</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 rounded-full px-7"
              disabled={!goat.available}
              onClick={() => {
                add({ id: goat.id, name: goat.name, breed: goat.breed, price: goat.price, image: goat.images[0] });
                toast.success(`${goat.name} added to cart`);
              }}
            >
              {t("goat.addToCart")}
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-7" disabled={!goat.available}>
              <Link
                to="/checkout"
                onClick={() => {
                  if (goat.available) add({ id: goat.id, name: goat.name, breed: goat.breed, price: goat.price, image: goat.images[0] });
                }}
              >
                {t("goat.buyNow")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
              <a
                href={whatsappLink(`Hi! I want to order ${goat.name} (${goat.breed}) — ${formatPKR(goat.price)}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="me-1 h-4 w-4" /> {t("goat.orderWhatsApp")}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl">More {goat.breed}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((g, i) => <GoatCard key={g.id} goat={g} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}
