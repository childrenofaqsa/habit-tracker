import { useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useMotionSettings } from "@/common/hooks/useMotionSettings";
import { useFinePointer } from "@/common/hooks/useFinePointer";

type Props = { children: React.ReactNode; className?: string };

export function Spotlight({ children, className }: Props) {
  const { cursorEffects } = useMotionSettings();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);
  const enabled = cursorEffects && fine;

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        if (!enabled || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        ref.current.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        ref.current.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      }}
      className={cn("relative", className)}
      style={
        {
          "--spot-x": "50%",
          "--spot-y": "50%",
        } as CSSProperties
      }
    >
      {enabled && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 transition-opacity"
          style={{
            background:
              "radial-gradient(180px circle at var(--spot-x) var(--spot-y), color-mix(in oklch, var(--color-primary) 18%, transparent), transparent 60%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
