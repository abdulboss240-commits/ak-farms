import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const { t } = useI18n();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const links: Array<{ to: string; key: Parameters<typeof t>[0] }> = [
    { to: "/", key: "nav.home" },
    { to: "/goats", key: "nav.goats" },
    { to: "/about", key: "nav.about" },
    { to: "/testimonials", key: "nav.testimonials" },
    { to: "/contact", key: "nav.contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-warm text-primary-foreground font-display text-lg shadow-soft">✦</span>
          <span className="font-display text-xl tracking-tight">
            Premium<span className="text-primary"> Goats</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/60"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-primary bg-primary/8" }}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />

          {isAdmin && (
            <Button asChild variant="ghost" size="icon" aria-label="Admin">
              <Link to="/admin"><LayoutDashboard className="h-5 w-5" /></Link>
            </Button>
          )}

          {user ? (
            <Button asChild variant="ghost" size="icon" aria-label="My account">
              <Link to="/account"><User className="h-5 w-5" /></Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth" search={{ next: "/" }}>Sign in</Link>
            </Button>
          )}

          <Link to="/cart" className="relative inline-flex">
            <Button variant="ghost" size="icon" aria-label={t("nav.cart")}>
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {count > 0 && (
              <span className="pointer-events-none absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground shadow-soft">
                {count}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background animate-fade-in">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6 lg:px-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 hover:bg-muted/60"
                activeProps={{ className: "rounded-md px-3 py-3 text-base font-semibold text-primary bg-primary/8" }}
              >
                {t(l.key)}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" search={{ next: "/" }} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 hover:bg-muted/60">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
