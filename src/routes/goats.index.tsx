import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { goats, breeds } from "@/data/goats";
import { GoatCard } from "@/components/GoatCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/goats/")({
  head: () => ({
    meta: [
      { title: "Browse Goats — Premium Goats" },
      { name: "description", content: "Browse our handpicked selection of healthy, vet-certified goats. Filter by breed and price, with nationwide delivery." },
      { property: "og:title", content: "Browse Goats — Premium Goats" },
      { property: "og:description", content: "Beetal, Makhi Cheeni, Teddy, Kamori and more. All vet-checked." },
    ],
  }),
  component: GoatsListing,
});

function GoatsListing() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [breed, setBreed] = useState<string>("all");
  const [sort, setSort] = useState<string>("featured");

  const filtered = useMemo(() => {
    let list = goats.slice();
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(needle) || g.breed.toLowerCase().includes(needle));
    }
    if (breed !== "all") list = list.filter((g) => g.breed === breed);
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [q, breed, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("nav.goats")}</p>
        <h1 className="mt-2 font-display text-5xl">{t("listings.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("listings.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-soft sm:grid-cols-[1fr_180px_200px]">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("listings.search")}
            className="h-11 ps-10 bg-background"
          />
        </div>
        <Select value={breed} onValueChange={setBreed}>
          <SelectTrigger className="h-11 bg-background"><SelectValue placeholder={t("listings.filter.breed")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("listings.filter.all")}</SelectItem>
            {breeds.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-11 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">{t("listings.sort.featured")}</SelectItem>
            <SelectItem value="priceAsc">{t("listings.sort.priceAsc")}</SelectItem>
            <SelectItem value="priceDesc">{t("listings.sort.priceDesc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">{t("listings.empty")}</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((g, i) => <GoatCard key={g.id} goat={g} index={i} />)}
        </div>
      )}
    </div>
  );
}
