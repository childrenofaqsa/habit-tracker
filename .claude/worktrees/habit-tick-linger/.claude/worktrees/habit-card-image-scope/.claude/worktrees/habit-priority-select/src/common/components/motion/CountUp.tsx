import { useEffect, useRef, useState } from "react";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";

type Props = { value: number; className?: string; suffix?: string };

export function CountUp({ value, className, suffix = "" }: Props) {
  const { reduced } = useMotionSettings();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const from = fromRef.current;
    const start = performance.now();
    const duration = 500;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      fromRef.current = value;
    };
  }, [value, reduced]);

  return (
    <span className={className}>
      {reduced ? value : display}
      {suffix}
    </span>
  );
}
