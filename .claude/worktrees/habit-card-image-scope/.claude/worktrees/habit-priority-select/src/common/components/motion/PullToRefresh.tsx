import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, RefreshCw } from "lucide-react";

type Props = { onRefresh: () => Promise<void>; children: React.ReactNode };

const THRESHOLD = 64;

export function PullToRefresh({ onRefresh, children }: Props) {
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [status, setStatus] = useState<"idle" | "refreshing" | "done">("idle");

  return (
    <div
      onTouchStart={(event) => {
        if (window.scrollY <= 0) startY.current = event.touches[0]!.clientY;
      }}
      onTouchMove={(event) => {
        if (startY.current === null) return;
        const delta = event.touches[0]!.clientY - startY.current;
        if (delta > 0 && window.scrollY <= 0) setPull(Math.min(90, delta * 0.5));
      }}
      onTouchEnd={async () => {
        if (pull > THRESHOLD) {
          setStatus("refreshing");
          try {
            await onRefresh();
            setStatus("done");
            setTimeout(() => setStatus("idle"), 600);
          } catch {
            setStatus("idle");
          }
        }
        setPull(0);
        startY.current = null;
      }}
    >
      <motion.div
        animate={{ height: status === "refreshing" ? 48 : pull }}
        className="flex items-center justify-center overflow-hidden text-primary"
      >
        {status === "done" ? (
          <Check className="size-5" />
        ) : (
          <motion.span
            animate={{ rotate: status === "refreshing" ? 360 : pull * 3 }}
            transition={status === "refreshing" ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
          >
            <RefreshCw className="size-5" />
          </motion.span>
        )}
      </motion.div>
      {children}
    </div>
  );
}
