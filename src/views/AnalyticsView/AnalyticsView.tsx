import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { selectTodaySummary } from "@/store/selectors";
import { useShallow } from "zustand/react/shallow";
import { CompletionChart } from "@/features/analytics/components/CompletionChart";
import { HistoryMatrix } from "@/features/analytics/components/HistoryMatrix";
import { Reveal } from "@/common/components/motion/Reveal";
import { BackupButton } from "@/features/backup/BackupButton";

const RANGES = [
  { label: "This Week", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "All", days: 0 },
] as const;

export function AnalyticsView() {
  const historyLength = useAppStore((state) => Object.keys(state.history).length);
  const allDays = useMemo(() => Math.max(historyLength, 30), [historyLength]);
  const [selectedRange, setSelectedRange] = useState<number>(30);
  const summary = useAppStore(useShallow(selectTodaySummary));

  const days = selectedRange === 0 ? allDays : selectedRange;

  return (
    <div className="space-y-8">
      <Reveal>
        <p className="text-sm text-muted-foreground">
          Track your progress and optimize your daily workflow.
        </p>
      </Reveal>
      <Reveal delay={0.02}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Today"
            value={`${summary.completion}%`}
            sublabel="Complete"
            variant="primary"
          />
          <StatCard
            label="Done"
            value={String(summary.done)}
            variant="success"
          />
          <StatCard
            label="Missed"
            value={String(summary.missed)}
            variant="destructive"
          />
          <StatCard
            label="Total"
            value={String(summary.total)}
            variant="default"
          />
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            History — Last 180 Days
          </h2>
          <HistoryMatrix days={180} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Performance Insights</h2>
              <p className="text-sm text-muted-foreground">Completion % By Day</p>
            </div>
            <div className="inline-flex rounded-lg bg-muted p-1">
              {RANGES.map((range) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => setSelectedRange(range.days)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    days === range.days
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 flex items-center gap-6 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Average Completion</span>
              <p className="text-lg font-bold text-foreground">
                {summary.completion}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-green-200 dark:bg-green-800" />
              <span className="text-xs text-muted-foreground">Target</span>
            </div>
          </div>

          <CompletionChart days={days} />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Data Management</h2>
            <span className="text-xs text-muted-foreground">
              Last backed up: recently
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <BackupButton />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  variant,
}: {
  label: string;
  value: string;
  sublabel?: string;
  variant: "primary" | "success" | "destructive" | "default";
}) {
  const valueColor = {
    primary: "text-primary",
    success: "text-green-600 dark:text-green-400",
    destructive: "text-red-600 dark:text-red-400",
    default: "text-foreground",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <p className={cn("mt-1 text-2xl font-bold", valueColor[variant])}>
        {value}
      </p>
      {sublabel && (
        <span className="text-xs text-muted-foreground">{sublabel}</span>
      )}
    </div>
  );
}
