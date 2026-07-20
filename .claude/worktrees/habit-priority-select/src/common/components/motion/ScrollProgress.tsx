import { motion, useScroll, useSpring } from "motion/react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

export function ScrollProgress() {
  const { scrollAnimations } = useMotionSettings();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  if (!scrollAnimations) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-primary to-accent"
    />
  );
}
