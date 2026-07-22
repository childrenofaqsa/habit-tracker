import { useEffect, useRef } from "react";
import { useResolvedTheme } from "@/common/hooks/useResolvedTheme";

export function ThemeManager() {
  const resolved = useResolvedTheme();
  const isFirstRun = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => root.classList.toggle("dark", resolved === "dark");

    if (isFirstRun.current) {
      isFirstRun.current = false;
      apply();
      return;
    }

    const supportsViewTransition = "startViewTransition" in document;
    if (supportsViewTransition) {
      const vt = (document as Document & {
        startViewTransition: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
      }).startViewTransition(apply);
      vt.ready.catch(() => {});
      vt.finished.catch(() => {});
    } else {
      apply();
    }
  }, [resolved]);

  return null;
}
