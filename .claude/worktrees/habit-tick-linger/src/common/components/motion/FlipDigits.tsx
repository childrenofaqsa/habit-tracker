import { AnimatePresence, motion } from "motion/react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

type Props = { value: number; className?: string };

export function FlipDigits({ value, className }: Props) {
  const { reduced } = useMotionSettings();
  const digits = String(value).split("");

  if (reduced) return <span className={className}>{value}</span>;

  return (
    <span className={className} aria-label={String(value)}>
      {digits.map((digit, index) => (
        <span
          key={index}
          className="relative inline-block overflow-hidden tabular-nums"
          style={{ height: "1em" }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={digit}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="inline-block"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
