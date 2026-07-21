import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { springs } from "@/lib/motionTokens";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";
import { useFinePointer } from "@/common/hooks/useFinePointer";

type Props = { children: React.ReactNode; className?: string; strength?: number };

export function Magnetic({ children, className, strength = 0.3 }: Props) {
  const { cursorEffects } = useMotionSettings();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springs.soft);
  const sy = useSpring(y, springs.soft);
  const enabled = cursorEffects && fine;

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={className}
      onPointerMove={(event) => {
        if (!enabled || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
