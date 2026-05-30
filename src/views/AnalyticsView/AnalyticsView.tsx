import { useState } from "react";
import { cn } from "@/lib/cn";
import { ANALYTICS_MATRIX_DAYS } from "@/lib/constants";
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

const RANGES = [30, 90, ANALYTICS_MATRIX_DAYS];

export function AnalyticsView() {
  const [days, setDays] = useState(ANALYTICS_MATRIX_DAYS);

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
                key={range}
                type="button"
                onClick={() => setDays(range)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  days === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {range}d
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
            {days}-day history
          </h2>
          <HistoryMatrix days={days} />
        </div>
      </Reveal>
    </div>
  );
}
