import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { GoatImage } from "@/components/GoatImage";
import type { GoatRow } from "@/lib/goats-api";
import { toast } from "sonner";

export function GoatCard({ goat, index = 0 }: { goat: GoatRow; index?: number }) {
  const { t } = useI18n();
  const add = useCart((s) => s.add);
  const available = goat.status === "available";
  const imagePath = goat.images?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-shadow hover:shadow-warm"
    >
      <Link to="/goats/$id" params={{ id: goat.id }} className="relative block overflow-hidden bg-muted">
        <GoatImage
          path={imagePath}
          alt={`${goat.name} — ${goat.breed}`}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 start-3 flex gap-2">
          <span className="rounded-full bg-success/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-success-foreground shadow-soft">
            {t("goat.healthy")}
          </span>
          {!available && (
            <span className="rounded-full bg-destructive/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-destructive-foreground shadow-soft">
              {goat.status === "reserved" ? "Reserved" : t("goat.sold")}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Link to="/goats/$id" params={{ id: goat.id }} className="block">
            <h3 className="font-display text-2xl leading-tight">{goat.name}</h3>
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">{goat.breed}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between"><dt>{t("goat.age")}</dt><dd className="text-foreground">{goat.age_months} {t("goat.months")}</dd></div>
          <div className="flex justify-between"><dt>{t("goat.weight")}</dt><dd className="text-foreground">{goat.weight_kg} {t("goat.kg")}</dd></div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-display text-2xl text-primary">{formatPKR(Number(goat.price))}</span>
          <Button
            size="sm"
            disabled={!available}
            onClick={() => {
              add({ id: goat.id, name: goat.name, breed: goat.breed, price: Number(goat.price), image: imagePath ?? "" });
              toast.success(`${goat.name} added to cart`);
            }}
          >
            {t("goat.addToCart")}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
