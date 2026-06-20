import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Premium Goats" },
      { name: "description", content: "Three generations of ethical livestock farming. Our mission, vision, and team." },
      { property: "og:title", content: "About Premium Goats" },
      { property: "og:description", content: "Three generations of ethical livestock farming." },
    ],
  }),
  component: About,
});

function About() {
  const { t, locale } = useI18n();
  const team = [
    { name: "Ahmed Raza", role: locale === "ur" ? "بانی اور ہیڈ فارمر" : "Founder & Head Farmer", initials: "AR" },
    { name: "Dr. Sana Iqbal", role: locale === "ur" ? "ویٹرنری ڈائریکٹر" : "Veterinary Director", initials: "SI" },
    { name: "Hassan Ali", role: locale === "ur" ? "آپریشنز ہیڈ" : "Operations Head", initials: "HA" },
    { name: "Maryam Sheikh", role: locale === "ur" ? "کسٹمر کیئر لیڈ" : "Customer Care Lead", initials: "MS" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("nav.about")}</p>
        <h1 className="mt-2 font-display text-5xl text-balance">{t("about.title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">{t("about.subtitle")}</p>
      </header>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <Card title={t("about.mission.title")} body={t("about.mission.body")} />
        <Card title={t("about.vision.title")} body={t("about.vision.body")} />
      </div>

      <section className="mt-24">
        <h2 className="font-display text-3xl text-center">{t("about.team.title")}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <div key={m.name} className="rounded-3xl border border-border/60 bg-card p-6 text-center shadow-soft">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full gradient-warm font-display text-2xl text-primary-foreground shadow-soft">
                {m.initials}
              </div>
              <h3 className="mt-4 font-display text-lg">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
      <h2 className="font-display text-3xl text-primary">{title}</h2>
      <p className="mt-3 text-foreground/80 leading-relaxed">{body}</p>
    </article>
  );
}
