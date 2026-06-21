import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Lock, Truck, Stethoscope, Headphones, Sparkles, Star, ArrowRight } from "lucide-react";
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1920} height={1280} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
        </div>

        <div className="mx-auto grid min-h-[88vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("hero.eyebrow")}
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-balance text-foreground sm:text-6xl lg:text-7xl">{t("hero.title")}</h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/75 text-pretty">{t("hero.subtitle")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7 shadow-warm">
                <Link to="/goats">{t("hero.cta.browse")} <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-foreground/20 bg-card/70 px-7 backdrop-blur">
                <Link to="/checkout">{t("hero.cta.book")}</Link>
              </Button>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              {[
                ["500+", locale === "ur" ? "خوش گاہک" : "Happy customers"],
                ["12", locale === "ur" ? "شہر" : "Cities"],
                ["100%", locale === "ur" ? "ویٹ معائنہ" : "Vet checked"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl text-primary">{n}</dt>
                  <dd className="text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      <section className="bg-grain py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("features.title")}</p>
            <h2 className="mt-3 font-display text-4xl text-balance sm:text-5xl">{t("features.subtitle")}</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, key }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft transition-shadow hover:shadow-warm">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl">{t(`features.${key}` as const)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`features.${key}.desc` as const)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("nav.goats")}</p>
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

      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("nav.testimonials")}</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("testimonials.title")}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((r, i) => (
              <motion.figure key={r.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: r.rating }).map((_, k) => (<Star key={k} className="h-4 w-4 fill-current" />))}
                </div>
                <blockquote className="mt-4 text-foreground/85">"{r.quote[locale]}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-muted-foreground"> · {r.city}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] gradient-warm px-8 py-16 text-center shadow-warm sm:px-16">
          <h2 className="font-display text-4xl text-primary-foreground sm:text-5xl">{t("hero.cta.book")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">{t("hero.subtitle")}</p>
          <Button asChild size="lg" variant="secondary" className="mt-8 h-12 rounded-full bg-card text-foreground hover:bg-card/90 px-8">
            <Link to="/goats">{t("hero.cta.browse")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
