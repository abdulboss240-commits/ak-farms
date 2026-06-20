import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT, whatsappLink } from "@/lib/format";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Premium Goats" },
      { name: "description", content: "Contact Premium Goats via WhatsApp, phone, email, or our farm location in Sahiwal, Punjab." },
      { property: "og:title", content: "Contact Premium Goats" },
      { property: "og:description", content: "We respond within an hour during business hours." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(1000),
});

function Contact() {
  const { t } = useI18n();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ name: fd.get("name"), email: fd.get("email"), message: fd.get("message") });
    if (!parsed.success) { toast.error("Please check the form."); return; }
    toast.success("Message sent. We'll be in touch soon.");
    e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("nav.contact")}</p>
        <h1 className="mt-2 font-display text-5xl">{t("contact.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("contact.subtitle")}</p>
      </header>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <ContactCard icon={MessageCircle} label={t("contact.whatsapp")} value={CONTACT.whatsapp} href={whatsappLink("Hi! I have a question.")} accent />
          <ContactCard icon={Phone} label={t("contact.phone")} value={CONTACT.phone} href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} />
          <ContactCard icon={Mail} label={t("contact.email")} value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
          <ContactCard icon={MapPin} label={t("contact.location")} value={CONTACT.address} />
          <div className="overflow-hidden rounded-3xl border border-border/60 shadow-soft">
            <iframe
              src={CONTACT.mapEmbed}
              title="Farm location"
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
          <h2 className="font-display text-2xl">Send us a message</h2>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name" className="mb-1.5 block text-sm">{t("contact.form.name")}</Label>
              <Input id="name" name="name" required maxLength={80} className="h-11" />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block text-sm">{t("contact.form.email")}</Label>
              <Input id="email" name="email" type="email" required maxLength={255} className="h-11" />
            </div>
            <div>
              <Label htmlFor="message" className="mb-1.5 block text-sm">{t("contact.form.message")}</Label>
              <Textarea id="message" name="message" required maxLength={1000} rows={6} />
            </div>
            <Button type="submit" size="lg" className="h-12 w-full rounded-full">{t("contact.form.send")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon, label, value, href, accent,
}: { icon: typeof Phone; label: string; value: string; href?: string; accent?: boolean }) {
  const inner = (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 shadow-soft transition-colors ${accent ? "border-success/30 bg-success/5 hover:bg-success/10" : "border-border/60 bg-card hover:bg-muted/50"}`}>
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${accent ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block">{inner}</a> : inner;
}
