import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";
import { useFinePointer } from "@/common/hooks/useFinePointer";

export function CursorCompanion() {
  const { cursorEffects } = useMotionSettings();
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const [active, setActive] = useState(false);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });
  const enabled = cursorEffects && fine;

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as HTMLElement | null;
      setActive(Boolean(target?.closest("button, a, [role='button'], input, select")));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      animate={{ scale: active ? 2.4 : 1, opacity: active ? 0.5 : 0.35 }}
      className="pointer-events-none fixed -left-1.5 -top-1.5 z-[60] size-3 rounded-full bg-primary mix-blend-difference"
    />
  );
}
