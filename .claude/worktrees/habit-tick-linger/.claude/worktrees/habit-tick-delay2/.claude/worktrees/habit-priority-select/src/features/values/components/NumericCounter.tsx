import { Minus, Plus } from "lucide-react";
import { Button } from "@/common/components/ui/data/button";
import { CountUp } from "@/common/components/motion/CountUp";

type Props = { value: number; onChange: (next: number) => void };

export function NumericCounter({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        size="icon"
        className="size-12 touch-target rounded-full"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <Minus className="size-5" />
      </Button>
      <CountUp value={value} className="min-w-12 text-center text-3xl font-bold tabular-nums" />
      <Button
        size="icon"
        className="size-12 touch-target rounded-full"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );
}
