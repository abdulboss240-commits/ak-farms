import { Languages } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "en" ? "ur" : "en")}
      className="gap-2 text-foreground/80 hover:text-foreground"
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{t("lang.toggle")}</span>
    </Button>
  );
}
