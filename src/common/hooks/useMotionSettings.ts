import { useReducedMotion } from "motion/react";
import type { MotionIntensity } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";

export type EffectiveMotion = {
  intensity: MotionIntensity;
  reduced: boolean;
  scrollAnimations: boolean;
  parallax: boolean;
  cursorEffects: boolean;
  haptics: boolean;
  sound: boolean;
  confetti: boolean;
};

export function useMotionSettings(): EffectiveMotion {
  const motion = useAppStore((state) => state.settings.motion);
  const systemReduced = useReducedMotion() ?? false;
  const reduced = motion.respectReducedMotion && systemReduced;
  const intensity: MotionIntensity = reduced ? "minimal" : motion.intensity;

  return {
    intensity,
    reduced,
    scrollAnimations: !reduced && motion.scrollAnimations && intensity !== "minimal",
    parallax: !reduced && motion.parallax && intensity === "playful",
    cursorEffects: !reduced && motion.cursorEffects && intensity !== "minimal",
    haptics: motion.haptics,
    sound: motion.sound,
    confetti: !reduced && motion.confetti,
  };
}
