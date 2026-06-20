import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Truck, ShieldCheck, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { fetchGoat, fetchGoats } from "@/lib/goats-api";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { formatPKR, whatsappLink } from "@/lib/format";
import { goatImageUrl } from "@/lib/storage";
import { GoatCard } from "@/components/GoatCard";
import { toast } from "sonner";

export const Route = createFileRoute("/goats/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Goat — Premium Goats` },
      { name: "description", content: `View details for goat ${params.id}.` },
    ],
  }),
  component: GoatDetail,
  errorComponent: () => <div className="p-8 text-center text-muted-foreground">Could not load this goat.</div>,
});

function GoatDetail() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const add = useCart((s) => s.add);

  const { data: goat, isLoading } = useQuery({ queryKey: ["goat", id], queryFn: () => fetchGoat(id) });
  const { data: allGoats = [] } = useQuery({ queryKey: ["goats"], queryFn: fetchGoats });

  if (isLoading) {
    return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }
  if (!goat) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl">Goat not found</h1>
        <Button asChild className="mt-6"><Link to="/goats">Back to listings</Link></Button>
      </div>
    );
  }

  const images = goat.images.length ? goat.images : [""];
  const related = allGoats.filter((g) => g.id !== goat.id && g.breed === goat.breed).slice(0, 4);
  const available = goat.status === "available";
  const price = Number(goat.price);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/goats" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("nav.goats")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft">
            <img
              src={goatImageUrl(images[active])}
              alt={goat.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-2xl border-2 transition-colors ${i === active ? "border-primary" : "border-transparent hover:border-border"}`}
                >
                  <img src={goatImageUrl(src)} alt="" loading="lazy" className="h-20 w-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">{goat.breed}</p>
          <h1 className="mt-2 font-display text-5xl">{goat.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl text-primary">{formatPKR(price)}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              {available ? t("goat.available") : goat.status === "reserved" ? "Reserved" : t("goat.sold")}
            </span>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card p-5 text-sm shadow-soft">
            <Stat label={t("goat.age")} value={`${goat.age_months} ${t("goat.months")}`} />
            <Stat label={t("goat.weight")} value={`${goat.weight_kg} ${t("goat.kg")}`} />
            <Stat label={t("goat.breed")} value={goat.breed} />
            <Stat label={t("goat.health")} value={t("goat.healthy")} />
          </dl>

          <div className="mt-6">
            <h2 className="font-display text-xl">{t("goat.description")}</h2>
            <p className="mt-2 text-foreground/80 leading-relaxed whitespace-pre-line">{goat.description}</p>
          </div>

          <ul className="mt-6 space-y-2.5 text-sm">
            {goat.farm && <li className="flex items-center gap-2.5 text-foreground/80"><MapPin className="h-4 w-4 text-primary" />{t("goat.farm")}: {goat.farm}</li>}
            <li className="flex items-center gap-2.5 text-foreground/80"><Truck className="h-4 w-4 text-primary" />{t("goat.delivery")}: 2–4 days, nationwide</li>
            <li className="flex items-center gap-2.5 text-foreground/80"><ShieldCheck className="h-4 w-4 text-primary" />Health certificate included</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 rounded-full px-7"
              disabled={!available}
              onClick={() => {
                add({ id: goat.id, name: goat.name, breed: goat.breed, price, image: goatImageUrl(images[0]) });
                toast.success(`${goat.name} added to cart`);
              }}
            >
              {t("goat.addToCart")}
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-7" disabled={!available}>
              <Link
                to="/checkout"
                onClick={() => {
                  if (available) add({ id: goat.id, name: goat.name, breed: goat.breed, price, image: goatImageUrl(images[0]) });
                }}
              >
                {t("goat.buyNow")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
              <a
                href={whatsappLink(`Hi! I want to order ${goat.name} (${goat.breed}) — ${formatPKR(price)}.`)}
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
