import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/cn";
import {
  formatClockTime12h,
  formatMatrixDayNumber,
  formatMatrixMonthShort,
  reverseChronologicalKeys,
} from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { buildMatrixRows } from "@/features/analytics/matrixData";
import type { MatrixFilter, MatrixRow } from "@/features/analytics/matrixData";
import type { DayRecord } from "@/lib/schema";

const COL_WIDTH = 84;
const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 56;
const LABEL_WIDTH = 180;
const COLUMN_CHUNK = 30;

const FILTER_OPTIONS: { id: MatrixFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "habits", label: "Habits" },
  { id: "values", label: "Values" },
];

export function TimeLogMatrix({ days }: { days: number }) {
  const habits = useAppStore((state) => state.habits);
  const values = useAppStore((state) => state.values);
  const history = useAppStore((state) => state.history);
  const categories = useAppStore((state) => state.categories);
  const timeframes = useAppStore((state) => state.timeframes);
  const [filter, setFilter] = useState<MatrixFilter>("all");
  const [visibleDays, setVisibleDays] = useState(Math.min(days, COLUMN_CHUNK));

  const rows = buildMatrixRows(habits, values, filter, categories, timeframes);
  const columns = reverseChronologicalKeys(visibleDays);

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: columns.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => COL_WIDTH,
    horizontal: true,
    overscan: 6,
  });

  useEffect(() => {
    setVisibleDays(Math.min(days, COLUMN_CHUNK));
  }, [days]);

  const loadMoreColumns = useCallback(() => {
    setVisibleDays((prev) => Math.min(days, prev + COLUMN_CHUNK));
  }, [days]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft > maxScroll - 80 && visibleDays < days) {
        loadMoreColumns();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMoreColumns, visibleDays, days]);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
        Add habits or values to see your time log.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg bg-muted p-1">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === option.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex">
          <div style={{ width: LABEL_WIDTH }} className="shrink-0 bg-card">
            <div
              style={{ height: HEADER_HEIGHT }}
              className="flex items-center border-b border-border px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {filter === "habits"
                ? "Habit"
                : filter === "values"
                  ? "Value"
                  : "Habit / Value"}
            </div>
            {rows.map((row) => (
              <div
                key={row.id}
                style={{ height: ROW_HEIGHT }}
                className="flex flex-col justify-center border-b border-border px-3"
              >
                <span className="truncate text-sm font-semibold text-foreground">
                  {row.name}
                </span>
                {row.category && (
                  <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {row.category}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div
            ref={scrollRef}
            className="no-scrollbar flex-1 overflow-x-auto will-change-transform"
          >
            <div
              style={{
                width: virtualizer.getTotalSize(),
                height: HEADER_HEIGHT + rows.length * ROW_HEIGHT,
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((item) => {
                const dayKey = columns[item.index]!;
                const record = history[dayKey];
                const isToday = item.index === 0;
                return (
                  <div
                    key={item.key}
                    style={{
                      position: "absolute",
                      left: item.start,
                      width: COL_WIDTH,
                      top: 0,
                    }}
                    className={cn(isToday && "bg-primary/5")}
                  >
                    <div
                      style={{ height: HEADER_HEIGHT }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-0.5 border-b border-l border-border",
                        isToday && "bg-primary/10 text-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "text-base font-bold leading-none",
                          isToday ? "text-primary" : "text-foreground",
                        )}
                      >
                        {formatMatrixDayNumber(dayKey)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold tracking-wide",
                          isToday ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {formatMatrixMonthShort(dayKey)}
                      </span>
                    </div>
                    {rows.map((row) => (
                      <TimeLogCell key={row.id} row={row} record={record} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeLogCell({
  row,
  record,
}: {
  row: MatrixRow;
  record: DayRecord | undefined;
}) {
  const base =
    "flex items-center justify-center border-b border-l border-border";
  const style = { height: ROW_HEIGHT };

  if (row.kind !== "habit") {
    return (
      <div className={base} style={style}>
        <span className="size-1.5 rounded-full bg-border" />
      </div>
    );
  }

  const status = record?.habitStatus[row.id];
  const time = record?.habitStatusTimes?.[row.id];

  if (!status || !time) {
    return (
      <div className={base} style={style}>
        <span className="size-1.5 rounded-full bg-border" />
      </div>
    );
  }

  const colorClass =
    status === "done"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className={base} style={style}>
      <span
        className={cn(
          "text-[11px] font-semibold tabular-nums tracking-tight",
          colorClass,
        )}
      >
        {formatClockTime12h(time)}
      </span>
    </div>
  );
}
