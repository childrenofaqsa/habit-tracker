import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";
import { useFinePointer } from "@/common/hooks/useFinePointer";

type Props = { children: React.ReactNode; className?: string; max?: number };

export function Tilt({ children, className, max = 6 }: Props) {
  const { cursorEffects } = useMotionSettings();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const enabled = cursorEffects && fine;

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 600 }}
      className={className}
      onPointerMove={(event) => {
        if (!enabled || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * max * 2);
        rotateX.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
