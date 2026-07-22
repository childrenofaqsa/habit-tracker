import { useEffect, useState } from "react";
import { getImageUrl } from "@/storage/imageStore";

export function useHabitImage(imageId: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = imageId ? await getImageUrl(imageId) : null;
      if (active) setUrl(result);
    })();
    return () => {
      active = false;
    };
  }, [imageId]);

  return url;
}
