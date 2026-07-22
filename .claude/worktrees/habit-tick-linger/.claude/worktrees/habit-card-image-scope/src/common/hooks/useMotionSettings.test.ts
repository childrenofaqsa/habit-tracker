import { describe, it, expect } from "vitest";
import type { MotionSettings } from "@/lib/schema";
import type { MotionIntensity } from "@/lib/constants";

type EffectiveMotion = {
  intensity: MotionIntensity;
  reduced: boolean;
  scrollAnimations: boolean;
  parallax: boolean;
  cursorEffects: boolean;
  haptics: boolean;
  sound: boolean;
  confetti: boolean;
};

function computeMotion(motion: MotionSettings, systemReduced: boolean): EffectiveMotion {
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

const defaultMotion: MotionSettings = {
  intensity: "standard",
  scrollAnimations: true,
  parallax: true,
  cursorEffects: true,
  haptics: true,
  sound: false,
  confetti: true,
  respectReducedMotion: true,
};

describe("motion settings computation", () => {
  describe("standard intensity", () => {
    it("enables scrollAnimations and cursorEffects", () => {
      const result = computeMotion(defaultMotion, false);
      expect(result.scrollAnimations).toBe(true);
      expect(result.cursorEffects).toBe(true);
      expect(result.confetti).toBe(true);
    });

    it("disables parallax (only playful)", () => {
      const result = computeMotion(defaultMotion, false);
      expect(result.parallax).toBe(false);
    });
  });

  describe("minimal intensity", () => {
    it("disables scrollAnimations and cursorEffects", () => {
      const motion = { ...defaultMotion, intensity: "minimal" as const };
      const result = computeMotion(motion, false);
      expect(result.scrollAnimations).toBe(false);
      expect(result.cursorEffects).toBe(false);
      expect(result.parallax).toBe(false);
    });

    it("still enables confetti (not intensity-gated)", () => {
      const motion = { ...defaultMotion, intensity: "minimal" as const };
      const result = computeMotion(motion, false);
      expect(result.confetti).toBe(true);
    });
  });

  describe("playful intensity", () => {
    it("enables all features including parallax", () => {
      const motion = { ...defaultMotion, intensity: "playful" as const };
      const result = computeMotion(motion, false);
      expect(result.scrollAnimations).toBe(true);
      expect(result.cursorEffects).toBe(true);
      expect(result.parallax).toBe(true);
      expect(result.confetti).toBe(true);
    });
  });

  describe("reduced motion", () => {
    it("overrides intensity to minimal when system prefers reduced motion", () => {
      const result = computeMotion(defaultMotion, true);
      expect(result.reduced).toBe(true);
      expect(result.intensity).toBe("minimal");
      expect(result.scrollAnimations).toBe(false);
      expect(result.parallax).toBe(false);
      expect(result.cursorEffects).toBe(false);
      expect(result.confetti).toBe(false);
    });

    it("does not reduce if respectReducedMotion is false", () => {
      const motion = { ...defaultMotion, respectReducedMotion: false };
      const result = computeMotion(motion, true);
      expect(result.reduced).toBe(false);
      expect(result.intensity).toBe("standard");
      expect(result.scrollAnimations).toBe(true);
    });

    it("haptics always follows user preference regardless of reduced motion", () => {
      const result = computeMotion(defaultMotion, true);
      expect(result.haptics).toBe(true);
    });

    it("sound always follows user preference", () => {
      const motion = { ...defaultMotion, sound: true };
      const result = computeMotion(motion, true);
      expect(result.sound).toBe(true);
    });
  });

  describe("individual toggles", () => {
    it("disables scrollAnimations when toggled off", () => {
      const motion = { ...defaultMotion, scrollAnimations: false };
      const result = computeMotion(motion, false);
      expect(result.scrollAnimations).toBe(false);
    });

    it("disables confetti when toggled off", () => {
      const motion = { ...defaultMotion, confetti: false };
      const result = computeMotion(motion, false);
      expect(result.confetti).toBe(false);
    });

    it("disables cursorEffects when toggled off", () => {
      const motion = { ...defaultMotion, cursorEffects: false };
      const result = computeMotion(motion, false);
      expect(result.cursorEffects).toBe(false);
    });
  });
});
