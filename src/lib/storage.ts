import { supabase } from "@/integrations/supabase/client";

const PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://yhnjmyfruzxbbmraazzp.supabase.co";

const BUCKET = "goat-images";
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23E9DCC9'/><text x='50%' y='52%' text-anchor='middle' font-family='serif' font-size='22' fill='%237A6A55'>No image</text></svg>`,
  );

/** Convert a stored image path (e.g. "uploads/abc.jpg") to a public URL. */
export function goatImageUrl(path?: string | null): string {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${PROJECT_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Upload a file to the goat-images bucket. Returns its storage path. */
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
