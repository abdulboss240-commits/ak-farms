import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Lock,
  Truck,
  Stethoscope,
  Headphones,
  Sparkles,
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { GoatCard } from "@/components/GoatCard";
import { fetchGoats } from "@/lib/goats-api";
import { testimonials } from "@/data/testimonials";
import bannerAsset from "@/assets/banner.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Premium Goats — Healthy farm-raised goats, delivered nationwide" },
      { name: "description", content: "Buy healthy, vet-certified farm-raised goats online. Beetal, Makhi Cheeni, Teddy, Kamori. Nationwide delivery across Pakistan." },
      { property: "og:title", content: "Premium Goats — Delivered To Your Doorstep" },
      { property: "og:description", content: "Healthy, vet-certified goats with nationwide delivery." },
      { property: "og:image", content: bannerAsset.url },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, locale } = useI18n();
  const { data: goats = [] } = useQuery({ queryKey: ["goats"], queryFn: fetchGoats });
  const featured = goats.slice(0, 4);

  const features = [
    { icon: ShieldCheck, key: "healthy" },
    { icon: Lock, key: "payments" },
    { icon: Truck, key: "delivery" },
    { icon: Stethoscope, key: "vet" },
    { icon: Headphones, key: "support" },
    { icon: Sparkles, key: "quality" },
  ] as const;

  return (
    <>
      {/* ============ HERO — BENTO ============ */}
      <section className="bg-grain px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid auto-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto]">

            {/* Headline tile */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-10 lg:col-span-7 lg:row-span-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {t("hero.eyebrow") || "Farm-raised · Vet-certified"}
              </p>
              <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                {t("hero.title") || "Healthy goats, delivered to your doorstep."}
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                {t("hero.subtitle") || "Hand-picked Beetal, Makhi Cheeni, Teddy and Kamori from our Sahiwal valley farm. Nationwide delivery in 2–4 days."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 rounded-full px-7 shadow-warm">
                  <Link to="/goats">{t("hero.cta.browse")} <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-foreground/15 px-7">
                  <Link to="/checkout">{t("hero.cta.book")}</Link>
                </Button>
              </div>
            </motion.div>

            {/* Banner image tile */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
              className="overflow-hidden rounded-3xl border border-border shadow-warm lg:col-span-5 lg:row-span-2"
            >
              <img
                src={bannerAsset.url}
                alt="Premium Goats"
                className="h-full min-h-[280px] w-full object-cover lg:min-h-[520px]"
              />
            </motion.div>

            {/* Stat tiles */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl gradient-warm p-7 text-primary-foreground shadow-warm lg:col-span-3"
            >
              <p className="font-display text-5xl">500+</p>
              <p className="mt-2 text-sm text-primary-foreground/80">Happy families across Pakistan</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-3xl border border-border bg-accent/40 p-7 lg:col-span-2"
            >
              <Stethoscope className="h-6 w-6 text-primary" />
              <p className="mt-3 font-display text-2xl leading-tight">Vet-certified health</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3 rounded-3xl border border-border bg-card p-7 lg:col-span-2"
            >
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Farm</p>
                <p className="font-display text-lg leading-tight">Sahiwal Valley</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES — BENTO ============ */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t("features.title")}</p>
            <h2 className="mt-3 font-display text-4xl text-balance sm:text-5xl">{t("features.subtitle")}</h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-6 md:auto-rows-[180px]">
            {features.map(({ icon: Icon, key }, i) => {
              // bento spans: 0=2, 1=2, 2=2, 3=3, 4=3, 5=6 wait — make 6 tiles fit nicely on 6 cols
              const spans = [
                "md:col-span-3", "md:col-span-3",
                "md:col-span-2", "md:col-span-2", "md:col-span-2",
                "md:col-span-6",
              ];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`group flex flex-col justify-between rounded-3xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-warm ${spans[i]} ${i === 5 ? "md:flex-row md:items-center md:gap-8 bg-accent/30" : ""}`}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={i === 5 ? "md:flex-1" : "mt-5"}>
                    <h3 className="font-display text-xl leading-tight sm:text-2xl">{t(`features.${key}` as const)}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{t(`features.${key}.desc` as const)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FEATURED GOATS ============ */}
      {featured.length > 0 && (
        <section className="bg-muted/50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t("nav.goats")}</p>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("listings.title")}</h2>
              </div>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/goats">{t("hero.cta.browse")} <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" /></Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((g, i) => <GoatCard key={g.id} goat={g} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ============ TESTIMONIALS ============ */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t("nav.testimonials")}</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("testimonials.title")}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((r, i) => (
              <motion.figure
                key={r.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-3xl border border-border bg-card p-7 shadow-soft"
              >
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: r.rating }).map((_, k) => (<Star key={k} className="h-4 w-4 fill-current" />))}
                </div>
                <blockquote className="mt-4 font-display text-lg leading-relaxed text-foreground/90">"{r.quote[locale]}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-muted-foreground"> · {r.city}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] gradient-warm px-8 py-16 text-center shadow-warm sm:px-16">
          <h2 className="font-display text-4xl text-primary-foreground text-balance sm:text-5xl">{t("hero.cta.book")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">{t("hero.subtitle")}</p>
          <Button asChild size="lg" variant="secondary" className="mt-8 h-12 rounded-full bg-card text-foreground hover:bg-card/90 px-8">
            <Link to="/goats">{t("hero.cta.browse")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
