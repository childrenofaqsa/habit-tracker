import { useMemo } from "react";
import { useHaptics } from "@/common/hooks/useHaptics";
import { useSound } from "@/common/hooks/useSound";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";
import {
  burstConfetti,
  elementOrigin,
  fullScreenConfetti,
  microConfetti,
} from "@/lib/confetti";

export type Celebration = {
  habitDone: (element: HTMLElement | null) => void;
  habitMissed: () => void;
  timeframeComplete: (element: HTMLElement | null) => void;
  dayComplete: () => void;
};

export function useCelebration(): Celebration {
  const { confetti: confettiEnabled } = useMotionSettings();
  const haptic = useHaptics();
  const sound = useSound();

  return useMemo<Celebration>(
    () => ({
      habitDone: (element) => {
        haptic("success");
        sound("done");
        if (confettiEnabled) microConfetti(elementOrigin(element));
      },
      habitMissed: () => haptic("warning"),
      timeframeComplete: (element) => {
        sound("done");
        if (confettiEnabled) burstConfetti(elementOrigin(element));
      },
      dayComplete: () => {
        haptic("success");
        sound("fanfare");
        if (confettiEnabled) fullScreenConfetti();
      },
    }),
    [confettiEnabled, haptic, sound],
  );
}
