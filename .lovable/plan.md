
# Premium Goats — Build Plan

This is a large scope. I'll build it in 4 phases so you get a working, clickable site fast, then layer real backend, payments, and admin on top. You can stop or redirect after any phase.

## Phase 1 — Storefront UI + Design System + i18n (English/Urdu)

Goal: a beautiful, fully clickable storefront with mock data you can demo today.

- Design system in `src/styles.css`: warm earth palette (deep terracotta, olive, cream, charcoal), generous type scale, soft shadows, rounded cards. Hero font: Fraunces (serif, editorial). Body: Inter. Urdu: Noto Nastaliq Urdu. All colors as HSL semantic tokens — no hard-coded colors in components.
- Routes (TanStack file-based):
  - `/` Home — hero banner (AI-generated goat + farm image), value props, featured goats, testimonials, CTA
  - `/goats` Listings with search, breed/price filters, sort
  - `/goats/$id` Product detail with image gallery, breed/age/weight/health, farm location, delivery options
  - `/cart` Cart with qty, remove, summary, delivery estimate
  - `/checkout` Customer form + address + payment method choice (Online / COD)
  - `/order/$id` Order confirmation + tracking
  - `/about`, `/testimonials`, `/contact` (WhatsApp button, phone, email, map embed, contact form)
- Components: `Header` (logo, nav, cart badge, language toggle), `Footer`, `GoatCard`, `Price`, `Badge` variants for health/availability, `WhatsAppFloat` button on every page.
- i18n: lightweight context-based translator with `en` and `ur` dictionaries, `lang` + `dir` set on `<html>`, RTL-aware Tailwind utilities. Strings stored in `src/i18n/`.
- Mock data in `src/data/goats.ts`. Cart in Zustand with localStorage persistence.
- Hero image + 6–8 goat images generated via `imagegen` (premium tier).
- SEO: per-route `head()` with unique title/description/OG; `sitemap.xml` + `robots.txt`.

## Phase 2 — Lovable Cloud Backend (data + auth)

- Enable Lovable Cloud.
- Tables (all with GRANTs + RLS):
  - `goats` (name, breed, age_months, weight_kg, price, description, farm_location, health_status, availability, images[], created_at) — public SELECT
  - `profiles` (id → auth.users, full_name, phone, address, city) — owner read/write
  - `orders` (id, user_id, items jsonb, subtotal, delivery_fee, total, customer info, payment_method, payment_status, delivery_status, tracking_notes, created_at) — owner read; admin all
  - `app_role` enum + `user_roles` table + `has_role()` security-definer fn (per security rules)
- Auth: email/password + Google (via Lovable broker + `configure_social_auth`).
- Replace mock data reads with public server fns that query goats; cart still client-side; checkout writes order via authenticated server fn.
- `/order/$id` reads from DB; status updates show through.

## Phase 3 — Stripe Payments + COD + Delivery Booking

- Enable seamless Stripe payments. Tax handling: I'll set up full compliance handling if you're in a supported seller country (digital products aren't a fit, so for physical livestock we'll use tax-calc-only). You'll confirm seller country when enabling.
- Create Stripe products for goats via the batch tool after Phase 2 seeds catalog.
- Checkout flow: choose Stripe Checkout (online) or COD; on success, mark order `paid`/`pending_cod` and redirect to confirmation.
- Webhook at `/api/public/webhooks/stripe` to confirm payment status.
- Delivery booking: city selector (Pakistan cities list), preferred delivery date picker, delivery-fee logic (flat per city, free over threshold). Tracking section shows status timeline (Pending → Confirmed → Out for delivery → Delivered).

## Phase 4 — Admin Dashboard + Polish

- `_authenticated/_admin` route group, gated by `has_role('admin')`.
- Admin pages:
  - `/admin/goats` — table with add/edit/delete, image uploads to Cloud storage
  - `/admin/orders` — list, view, update delivery status, add tracking notes
  - `/admin/customers` — list profiles + order history
  - `/admin/reports` — revenue, orders by status, top breeds (Recharts)
- WhatsApp order integration: "Order on WhatsApp" button on product + cart that pre-fills a message to your number (you'll provide it).
- Performance & polish: image lazy-loading, route preloading, framer-motion fade/slide animations on hero and cards, mobile QA pass.

## Technical notes (skip if you want)

- Stack: TanStack Start + React 19, Tailwind v4, shadcn, TanStack Query, Lovable Cloud (Supabase under the hood), seamless Stripe.
- i18n: custom minimal provider — no `react-i18next` dependency. RTL handled via `dir="rtl"` on `<html>` plus Tailwind's logical properties where available, manual flips where not.
- Server work: `createServerFn` for app reads/writes; `/api/public/*` only for the Stripe webhook.
- Admin role stored in `user_roles` table (never on profile) per security rules.

## What I need from you to proceed

1. **Approve this plan** (or tell me what to change/cut).
2. **WhatsApp number + phone + email** for the contact page and WhatsApp order button (can be placeholders for now).
3. **Country of operation** (assuming Pakistan — confirms city list, currency PKR, and Stripe seller country).
4. **Currency** — PKR (₨) or USD?

Once you approve, I'll start Phase 1 immediately. Phase 2 enables Cloud, Phase 3 enables Stripe payments (which will prompt you for a Stripe email and Pro plan).
