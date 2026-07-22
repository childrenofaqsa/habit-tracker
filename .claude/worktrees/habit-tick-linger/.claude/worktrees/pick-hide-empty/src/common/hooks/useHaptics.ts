import { useCallback } from "react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

export type HapticPattern = "tap" | "success" | "warning";

const patterns: Record<HapticPattern, number | number[]> = {
  tap: 8,
  success: [12, 40, 12],
  warning: [20, 60],
};

export function useHaptics(): (pattern: HapticPattern) => void {
  const { haptics } = useMotionSettings();
  return useCallback(
    (pattern: HapticPattern) => {
      if (!haptics) return;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(patterns[pattern]);
      }
    },
    [haptics],
  );
}
