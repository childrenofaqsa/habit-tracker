import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { scrollAnimations } = useMotionSettings();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scrollAnimations) return;
    const instance = new Lenis({ smoothWheel: true, lerp: 0.12, wheelMultiplier: 1 });

    const raf = (time: number) => {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      instance.destroy();
    };
  }, [scrollAnimations]);

  return <>{children}</>;
}
