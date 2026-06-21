import { useQuery } from "@tanstack/react-query";
import { getGoatImageUrl, IMAGE_PLACEHOLDER } from "@/lib/storage";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  path?: string | null;
}

/**
 * Resolves a storage path to a signed URL and renders it as an image.
 * Falls back to a placeholder while loading.
 */
export function GoatImage({ path, alt = "", ...rest }: Props) {
  const { data: url } = useQuery({
    queryKey: ["goat-image", path],
    queryFn: () => getGoatImageUrl(path),
    enabled: !!path,
    staleTime: 1000 * 60 * 60, // 1h
  });
  return <img {...rest} src={url ?? IMAGE_PLACEHOLDER} alt={alt} />;
}
