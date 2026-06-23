import { useQuery } from "@tanstack/react-query";
import { getGoatImageUrl, IMAGE_PLACEHOLDER } from "@/lib/storage";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  path?: string | null;
}

/**
 * Resolves a storage path to a signed URL and renders it as an image.
 * Falls back to a placeholder while loading.
 */
export function GoatImage({ path, alt = "", onError, ...rest }: Props) {
  const { data: url } = useQuery({
    queryKey: ["goat-image", path],
    queryFn: () => getGoatImageUrl(path),
    enabled: !!path,
    staleTime: 1000 * 60 * 60, // 1h
  });

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    if (event.currentTarget.src !== IMAGE_PLACEHOLDER) {
      event.currentTarget.src = IMAGE_PLACEHOLDER;
    }
    onError?.(event);
  };

  return <img {...rest} src={url ?? IMAGE_PLACEHOLDER} alt={alt} onError={handleError} />;
}
