import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

type Props = {
  children: React.ReactNode;
  className?: string;
  speed?: number;
};

export function Parallax({ children, className, speed = 0.15 }: Props) {
  const { parallax } = useMotionSettings();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${-speed * 100}%`]);

  return (
    <motion.div ref={ref} style={parallax ? { y } : undefined} className={className}>
      {children}
    </motion.div>
  );
}
