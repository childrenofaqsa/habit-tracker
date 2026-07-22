import { useSyncExternalStore } from "react";

export type LayoutKind = "mobile" | "tablet" | "smallDesktop" | "largeDesktop";

function getLayout(width: number): LayoutKind {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1440) return "smallDesktop";
  return "largeDesktop";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

export function useResponsiveLayout(): {
  layout: LayoutKind;
  isDesktop: boolean;
  isTabletUp: boolean;
} {
  const width = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 1024,
  );
  const layout = getLayout(width);
  return {
    layout,
    isDesktop: layout === "smallDesktop" || layout === "largeDesktop",
    isTabletUp: layout !== "mobile",
  };
}
