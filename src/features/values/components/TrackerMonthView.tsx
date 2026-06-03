import { format, getDaysInMonth, getDay, startOfMonth, isToday } from "date-fns";
import type { ValueTracker } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";
import { aggregateValueEntries } from "@/lib/aggregate";

type Props = {
  value: ValueTracker;
  currentMonth: Date;
};

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function meetsGoal(entry: number | string | undefined, goalTarget: number | null): boolean {
  if (entry === undefined || entry === null || entry === "") return false;
  if (typeof entry === "number" && goalTarget !== null) return entry >= goalTarget;
  return typeof entry === "string" && entry.trim().length > 0;
}

export function TrackerMonthView({ value, currentMonth }: Props) {
  const history = useAppStore((s) => s.history);

  const daysInMonth = getDaysInMonth(currentMonth);
  const startOffset = getDay(startOfMonth(currentMonth));
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  function getEntry(day: number): number | string | undefined {
    const dateKey = format(new Date(year, month, day), "yyyy-MM-dd");
    return aggregateValueEntries(history[dateKey]?.valueEntries[value.id], value.type);
  }

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const date = new Date(year, month, day);
          const entry = getEntry(day);
          const met = meetsGoal(entry, value.goalTarget);
          const todayDate = isToday(date);
          const displayValue =
            entry !== undefined && entry !== ""
              ? typeof entry === "number"
                ? String(entry)
                : (entry as string).slice(0, 4)
              : null;

          return (
            <div
              key={day}
              className={cn(
                "flex flex-col items-center justify-start rounded-xl py-2 px-1 min-h-[56px]",
                met ? "bg-primary/15" : "bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                  todayDate
                    ? "bg-primary text-primary-foreground"
                    : met
                      ? "text-primary"
                      : "text-foreground",
                )}
              >
                {day}
              </div>
              {displayValue && (
                <span
                  className={cn(
                    "mt-1 text-[10px] font-semibold",
                    met ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {displayValue}
                </span>
              )}
              {met && !displayValue && (
                <span className="mt-1 text-[10px] text-primary">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
