import confetti from "canvas-confetti";

type Origin = { x: number; y: number };

export function elementOrigin(element: HTMLElement | null): Origin {
  if (!element) return { x: 0.5, y: 0.5 };
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
}

export function microConfetti(origin: Origin): void {
  void confetti({
    particleCount: 8,
    spread: 45,
    startVelocity: 22,
    gravity: 0.9,
    scalar: 0.7,
    origin,
    disableForReducedMotion: true,
  });
}

export function burstConfetti(origin: Origin): void {
  void confetti({
    particleCount: 40,
    spread: 80,
    startVelocity: 38,
    origin,
    disableForReducedMotion: true,
  });
}

export function fullScreenConfetti(): void {
  const ends = Date.now() + 800;
  const frame = () => {
    void confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      disableForReducedMotion: true,
    });
    void confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      disableForReducedMotion: true,
    });
    if (Date.now() < ends) requestAnimationFrame(frame);
  };
  frame();
}
