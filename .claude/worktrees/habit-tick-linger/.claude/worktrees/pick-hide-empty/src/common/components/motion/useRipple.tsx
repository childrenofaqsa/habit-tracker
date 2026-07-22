import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

type RippleSpec = { id: number; x: number; y: number };

export function useRipple() {
  const { reduced } = useMotionSettings();
  const [ripples, setRipples] = useState<RippleSpec[]>([]);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const id = performance.now();
    setRipples((current) => [
      ...current,
      { id, x: event.clientX - rect.left, y: event.clientY - rect.top },
    ]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== id));
    }, 500);
  };

  const rippleLayer = (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ left: ripple.x, top: ripple.y, backgroundColor: "currentColor" }}
            className="absolute -ml-6 -mt-6 size-12 rounded-full opacity-30"
          />
        ))}
      </AnimatePresence>
    </span>
  );

  return { onPointerDown, rippleLayer };
}
