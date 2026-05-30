import { useCallback, useRef } from "react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

export type SoundName = "tap" | "done" | "fanfare";

export function useSound(): (name: SoundName) => void {
  const { sound } = useMotionSettings();
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback(
    (name: SoundName) => {
      if (!sound) return;
      const Ctx = window.AudioContext;
      if (!Ctx) return;
      if (!ctxRef.current) ctxRef.current = new Ctx();
      const ctx = ctxRef.current;
      const now = ctx.currentTime;

      const tones: Record<SoundName, number[]> = {
        tap: [800],
        done: [660, 880],
        fanfare: [523, 659, 784, 1046],
      };

      tones[name].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        const start = now + index * 0.08;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    },
    [sound],
  );
}
