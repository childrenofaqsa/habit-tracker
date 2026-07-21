import { useSyncExternalStore } from "react";
import { useAppStore } from "@/store/useAppStore";

function subscribeMedia(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useResolvedTheme(): "light" | "dark" {
  const theme = useAppStore((state) => state.settings.theme);
  const systemDark = useSyncExternalStore(
    subscribeMedia,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}
