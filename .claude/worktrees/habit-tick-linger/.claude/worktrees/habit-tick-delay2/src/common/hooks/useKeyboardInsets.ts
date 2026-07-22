import { useEffect } from "react";

export function useKeyboardInsets(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height);
      document.documentElement.style.setProperty("--keyboard-inset", `${offset}px`);
      const active = document.activeElement;
      if (
        offset > 120 &&
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        active.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);
}
