import type { Transition } from "motion/react";

export const springs = {
  soft: { type: "spring", stiffness: 260, damping: 26 } satisfies Transition,
  snappy: { type: "spring", stiffness: 420, damping: 30 } satisfies Transition,
  press: { type: "spring", stiffness: 600, damping: 22 } satisfies Transition,
  gentle: { type: "spring", stiffness: 140, damping: 20 } satisfies Transition,
};

export const durations = {
  fast: 0.16,
  base: 0.22,
  slow: 0.34,
};

export const revealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
