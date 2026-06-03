import { useState } from "react";
import {
  format,
  startOfMonth,
  startOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  getDaysInMonth,
  addDays,
  isBefore,
  startOfDay,
} from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { ValueTracker, ValueType, DayRecord } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { cn } from "@/lib/cn";
import { toDateKey } from "@/lib/date";
import { aggregateValueEntries } from "@/lib/aggregate";
import { TrackerMonthView } from "./TrackerMonthView";
import { TrackerWeekView } from "./TrackerWeekView";
import { TrackerListView } from "./TrackerListView";

type Props = {
  value: ValueTracker;
  onBack: () => void;
};

type LogView = "month" | "week" | "list";

const LOG_VIEW_LABELS: { id: LogView; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "list", label: "List" },
];

function meetsGoal(entry: number | string | undefined, goalTarget: number | null): boolean {
  if (entry === undefined || entry === null || entry === "") return false;
  if (typeof entry === "number" && goalTarget !== null) return entry >= goalTarget;
  return typeof entry === "string" && entry.trim().length > 0;
}

function calcMonthStats(
  history: Record<string, DayRecord>,
  valueId: string,
  valueType: ValueType,
  monthDate: Date,
  goalTarget: number | null,
): { met: number; total: number } {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = getDaysInMonth(monthDate);
  let met = 0;
  let total = 0;
  const today = startOfDay(new Date());
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (isBefore(today, startOfDay(date))) break;
    total++;
    const dateKey = toDateKey(date);
    const entry = aggregateValueEntries(history[dateKey]?.valueEntries[valueId], valueType);
    if (meetsGoal(entry, goalTarget)) met++;
  }
  return { met, total };
}

function calcWeekStats(
  history: Record<string, DayRecord>,
  valueId: string,
  valueType: ValueType,
  weekStart: Date,
  goalTarget: number | null,
): { met: number; total: number } {
  let met = 0;
  let total = 0;
  const today = startOfDay(new Date());
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    if (isBefore(today, startOfDay(date))) break;
    total++;
    const dateKey = toDateKey(date);
    const entry = aggregateValueEntries(history[dateKey]?.valueEntries[valueId], valueType);
    if (meetsGoal(entry, goalTarget)) met++;
  }
  return { met, total };
}

export function TrackerDetailView({ value, onBack }: Props) {
  const trackerLogView = useUiStore((s) => s.trackerLogView);
  const setTrackerLogView = useUiStore((s) => s.setTrackerLogView);
  const history = useAppStore((s) => s.history);

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 }),
  );

  const today = startOfDay(new Date());
  const todayMonth = startOfMonth(today);
  const todayWeek = startOfWeek(today, { weekStartsOn: 0 });

  function canGoNextMonth() {
    return isBefore(currentMonth, todayMonth);
  }
  function canGoNextWeek() {
    return isBefore(currentWeekStart, todayWeek);
  }

  const { met, total } =
    trackerLogView === "month"
      ? calcMonthStats(history, value.id, value.type, currentMonth, value.goalTarget)
      : calcWeekStats(history, value.id, value.type, currentWeekStart, value.goalTarget);

  const completionRate = total > 0 ? Math.round((met / total) * 100) : 0;

  const periodLabel =
    trackerLogView === "month"
      ? format(currentMonth, "MMMM yyyy")
      : `${format(currentWeekStart, "MMM d")} – ${format(addDays(currentWeekStart, 6), "MMM d")}`;

  const goalLabel =
    value.goalTarget !== null ? `${value.goalTarget} ${value.unit || ""}`.trim() : "—";

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h2 className="flex-1 truncate text-xl font-bold">{value.name}</h2>
        <div className="flex rounded-lg bg-muted p-1">
          {LOG_VIEW_LABELS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTrackerLogView(opt.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                trackerLogView === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Daily Goal
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">{goalLabel}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                trackerLogView === "month"
                  ? setCurrentMonth((m) => subMonths(m, 1))
                  : setCurrentWeekStart((w) => subWeeks(w, 1))
              }
              className="rounded-lg p-1 hover:bg-muted"
            >
              <ChevronLeft className="size-4 text-muted-foreground" />
            </button>
            <p className="min-w-0 flex-1 truncate text-[10px] font-semibold text-foreground">
              {periodLabel}
            </p>
            <button
              type="button"
              disabled={
                trackerLogView === "month" ? !canGoNextMonth() : !canGoNextWeek()
              }
              onClick={() =>
                trackerLogView === "month"
                  ? setCurrentMonth((m) => addMonths(m, 1))
                  : setCurrentWeekStart((w) => addWeeks(w, 1))
              }
              className="rounded-lg p-1 hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Completion
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">{completionRate}%</p>
          <p className="text-[10px] text-muted-foreground">
            {met}/{total} days
          </p>
        </div>
      </div>

      {trackerLogView === "month" && (
        <TrackerMonthView value={value} currentMonth={currentMonth} />
      )}
      {trackerLogView === "week" && (
        <TrackerWeekView value={value} currentWeekStart={currentWeekStart} />
      )}
      {trackerLogView === "list" && (
        <TrackerListView value={value} currentWeekStart={currentWeekStart} />
      )}
    </div>
  );
}
