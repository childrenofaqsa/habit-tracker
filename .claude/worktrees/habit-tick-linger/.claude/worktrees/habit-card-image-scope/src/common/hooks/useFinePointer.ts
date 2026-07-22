import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  const media = window.matchMedia("(pointer: fine)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );
}
