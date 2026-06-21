import { supabase } from "@/integrations/supabase/client";

const BUCKET = "goat-images";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23E9DCC9'/><text x='50%' y='52%' text-anchor='middle' font-family='serif' font-size='22' fill='%237A6A55'>No image</text></svg>`,
  );

// Simple in-memory cache for signed URLs, keyed by path.
const cache = new Map<string, { url: string; exp: number }>();
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function getGoatImageUrl(path?: string | null): Promise<string> {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const now = Math.floor(Date.now() / 1000);
  const cached = cache.get(path);
  if (cached && cached.exp - 300 > now) return cached.url;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL_SECONDS);
  if (error || !data) return PLACEHOLDER;
  cache.set(path, { url: data.signedUrl, exp: now + TTL_SECONDS });
  return data.signedUrl;
}

/** Synchronous helper that returns cached URL or placeholder while loading. */
export function getGoatImageUrlSync(path?: string | null): string {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return cache.get(path)?.url ?? PLACEHOLDER;
}

/** Resolve many image paths at once and prime the cache. */
export async function primeGoatImageUrls(paths: (string | null | undefined)[]) {
  const toResolve = Array.from(
    new Set(paths.filter((p): p is string => !!p && !p.startsWith("http") && !p.startsWith("data:") && !cache.has(p))),
  );
  if (!toResolve.length) return;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(toResolve, TTL_SECONDS);
  if (!data) return;
  const now = Math.floor(Date.now() / 1000);
  data.forEach((d) => {
    if (d.path && d.signedUrl) cache.set(d.path, { url: d.signedUrl, exp: now + TTL_SECONDS });
  });
}

export async function uploadGoatImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `uploads/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteGoatImage(path: string) {
  if (!path || path.startsWith("seed/")) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export { PLACEHOLDER as IMAGE_PLACEHOLDER };
