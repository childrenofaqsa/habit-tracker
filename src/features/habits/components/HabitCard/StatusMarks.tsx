import { motion } from "motion/react";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

export function CheckMark() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="size-10 text-success-foreground"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      <motion.path
        d="M5 13 L10 18 L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={draw}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.28, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

export function CrossMark() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="size-10 text-destructive-foreground"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      <motion.path
        d="M7 7 L17 17"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        variants={draw}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.18 }}
      />
      <motion.path
        d="M17 7 L7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        variants={draw}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.18, delay: 0.1 }}
      />
    </motion.svg>
  );
}
