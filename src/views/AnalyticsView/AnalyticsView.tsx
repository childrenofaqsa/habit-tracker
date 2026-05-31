import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { SummaryBanner } from "@/features/analytics/components/SummaryBanner";
import { CompletionChart } from "@/features/analytics/components/CompletionChart";
import { HistoryMatrix } from "@/features/analytics/components/HistoryMatrix";
import { Reveal } from "@/common/components/motion/Reveal";
import { ScrollProgress } from "@/common/components/motion/ScrollProgress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/common/components/ui/data/card";

const RANGES = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "All", days: 0 },
] as const;

export function AnalyticsView() {
  const historyKeys = useAppStore((state) => Object.keys(state.history));
  const allDays = useMemo(() => Math.max(historyKeys.length, 30), [historyKeys.length]);
  const [selectedRange, setSelectedRange] = useState<number>(0);

  const days = selectedRange === 0 ? allDays : selectedRange;

  return (
    <div className="space-y-6">
      <ScrollProgress />
      <SummaryBanner />

      <Reveal>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Completion trend</CardTitle>
          <div className="inline-flex rounded-lg bg-muted p-1">
            {RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => setSelectedRange(range.days)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  (range.days === 0 ? selectedRange === 0 : days === range.days && selectedRange !== 0)
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <CompletionChart days={days} />
        </CardContent>
      </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            History
          </h2>
          <HistoryMatrix days={days} />
        </div>
      </Reveal>
    </div>
  );
}
