import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { testimonials } from "@/data/testimonials";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Customer Reviews — Premium Goats" },
      { name: "description", content: "Real reviews from families across Pakistan who chose Premium Goats." },
      { property: "og:title", content: "Customer Reviews — Premium Goats" },
      { property: "og:description", content: "What our customers say." },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  const { t, locale } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("nav.testimonials")}</p>
        <h1 className="mt-2 font-display text-5xl">{t("testimonials.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("testimonials.subtitle")}</p>
      </header>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {testimonials.map((r) => (
          <figure key={r.id} className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
            <div className="flex gap-0.5 text-primary">
              {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-5 w-5 fill-current" />)}
            </div>
            <blockquote className="mt-5 text-lg leading-relaxed text-foreground/85">"{r.quote[locale]}"</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-display text-primary">
                {r.name[0]}
              </div>
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.city}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
