import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { fetchGoats } from "@/lib/goats-api";
import { GoatCard } from "@/components/GoatCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/goats/")({
  head: () => ({
    meta: [
      { title: "Browse Goats — Premium Goats" },
      { name: "description", content: "Browse our handpicked selection of healthy, vet-certified goats. Filter by breed, price and weight, with nationwide delivery." },
      { property: "og:title", content: "Browse Goats — Premium Goats" },
      { property: "og:description", content: "Beetal, Makhi Cheeni, Teddy, Kamori and more. All vet-checked." },
    ],
  }),
  component: GoatsListing,
});

function GoatsListing() {
  const { t } = useI18n();
  const { data: goats = [], isLoading } = useQuery({ queryKey: ["goats"], queryFn: fetchGoats });

  const [q, setQ] = useState("");
  const [breed, setBreed] = useState<string>("all");
  const [sort, setSort] = useState<string>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [maxWeight, setMaxWeight] = useState<number>(100);

  const breeds = useMemo(() => Array.from(new Set(goats.map((g) => g.breed))).sort(), [goats]);

  const filtered = useMemo(() => {
    let list = goats.slice();
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(needle) || g.breed.toLowerCase().includes(needle));
    }
    if (breed !== "all") list = list.filter((g) => g.breed === breed);
    list = list.filter((g) => Number(g.price) <= maxPrice && Number(g.weight_kg) <= maxWeight);
    if (sort === "priceAsc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "priceDesc") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "weightDesc") list.sort((a, b) => Number(b.weight_kg) - Number(a.weight_kg));
    return list;
  }, [goats, q, breed, sort, maxPrice, maxWeight]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">{t("nav.goats")}</p>
        <h1 className="mt-2 font-display text-5xl">{t("listings.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("listings.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft md:grid-cols-3 lg:grid-cols-4">
        <div className="relative md:col-span-2 lg:col-span-1">
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
            <SelectItem value="weightDesc">Heaviest first</SelectItem>
          </SelectContent>
        </Select>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Max price</span>
            <span className="text-foreground">PKR {maxPrice.toLocaleString()}</span>
          </div>
          <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={20000} max={300000} step={5000} />
        </div>
        <div className="space-y-1 md:col-start-1 lg:col-start-auto">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Max weight</span>
            <span className="text-foreground">{maxWeight} kg</span>
          </div>
          <Slider value={[maxWeight]} onValueChange={(v) => setMaxWeight(v[0])} min={10} max={100} step={2} />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">{t("listings.empty")}</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((g, i) => <GoatCard key={g.id} goat={g} index={i} />)}
        </div>
      )}
    </div>
  );
}
