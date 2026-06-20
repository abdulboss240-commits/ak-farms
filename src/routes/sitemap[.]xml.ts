import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { goats } from "@/data/goats";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticEntries = [
          { path: "/", priority: "1.0", changefreq: "weekly" as const },
          { path: "/goats", priority: "0.9", changefreq: "daily" as const },
          { path: "/about", priority: "0.6", changefreq: "monthly" as const },
          { path: "/testimonials", priority: "0.5", changefreq: "monthly" as const },
          { path: "/contact", priority: "0.6", changefreq: "monthly" as const },
        ];
        const goatEntries = goats.map((g) => ({
          path: `/goats/${g.id}`,
          priority: "0.8",
          changefreq: "weekly" as const,
        }));
        const urls = [...staticEntries, ...goatEntries].map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
