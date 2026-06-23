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

type ResolvedImageRef =
  | { kind: "direct"; value: string }
  | { kind: "storage"; value: string };

function resolveImageRef(path?: string | null): ResolvedImageRef | null {
  const value = path?.trim();
  if (!value) return null;
  if (value.startsWith("data:")) return { kind: "direct", value };

  const storageUrlMatch = value.match(
    /\/storage\/v1\/object\/(?:sign|public|authenticated)\/goat-images\/([^?]+)/,
  );
  if (storageUrlMatch?.[1]) {
    return { kind: "storage", value: decodeURIComponent(storageUrlMatch[1]) };
  }

  if (value.startsWith(`${BUCKET}/`)) {
    return { kind: "storage", value: value.slice(BUCKET.length + 1) };
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return { kind: "direct", value };
  }

  return { kind: "storage", value };
}

export async function getGoatImageUrl(path?: string | null): Promise<string> {
  const imageRef = resolveImageRef(path);
  if (!imageRef) return PLACEHOLDER;
  if (imageRef.kind === "direct") return imageRef.value;

  const storagePath = imageRef.value;
  const now = Math.floor(Date.now() / 1000);
  const cached = cache.get(storagePath);
  if (cached && cached.exp - 300 > now) return cached.url;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, TTL_SECONDS);
  if (error || !data) return PLACEHOLDER;
  cache.set(storagePath, { url: data.signedUrl, exp: now + TTL_SECONDS });
  return data.signedUrl;
}

/** Synchronous helper that returns cached URL or placeholder while loading. */
export function getGoatImageUrlSync(path?: string | null): string {
  const imageRef = resolveImageRef(path);
  if (!imageRef) return PLACEHOLDER;
  if (imageRef.kind === "direct") return imageRef.value;
  return cache.get(imageRef.value)?.url ?? PLACEHOLDER;
}

/** Resolve many image paths at once and prime the cache. */
export async function primeGoatImageUrls(paths: (string | null | undefined)[]) {
  const toResolve = Array.from(
    new Set(
      paths
        .map(resolveImageRef)
        .filter((ref): ref is { kind: "storage"; value: string } => ref?.kind === "storage" && !cache.has(ref.value))
        .map((ref) => ref.value),
    ),
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
