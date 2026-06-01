import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePinch } from "@use-gesture/react";
import { cn } from "@/lib/cn";
import { reverseChronologicalKeys, formatMatrixDate } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { buildMatrixRows } from "@/features/analytics/matrixData";
import type { MatrixFilter } from "@/features/analytics/matrixData";
import { MatrixCell } from "@/features/analytics/components/MatrixCell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/overlay/dialog";

const BASE_COL = 46;
const BASE_ROW = 42;
const BASE_HEADER = 30;
const LABEL_WIDTH = 140;
const COLUMN_CHUNK = 30;

const FILTER_OPTIONS: { id: MatrixFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "habits", label: "Habits" },
  { id: "values", label: "Values" },
];

export function HistoryMatrix({ days }: { days: number }) {
  const habits = useAppStore((state) => state.habits);
  const values = useAppStore((state) => state.values);
  const history = useAppStore((state) => state.history);
  const categories = useAppStore((state) => state.categories);
  const [filter, setFilter] = useState<MatrixFilter>("all");
  const [visibleDays, setVisibleDays] = useState(Math.min(days, COLUMN_CHUNK));

  const rows = buildMatrixRows(habits, values, filter, categories);
  const columns = reverseChronologicalKeys(visibleDays);

  const [scale, setScale] = useState(1);
  const [note, setNote] = useState<{ name: string; text: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<HTMLDivElement>(null);

  const colWidth = Math.round(BASE_COL * scale);
  const rowHeight = Math.round(BASE_ROW * scale);
  const headerHeight = Math.round(BASE_HEADER * scale);

  const virtualizer = useVirtualizer({
    count: columns.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => colWidth,
    horizontal: true,
    overscan: 6,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [colWidth, virtualizer]);

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

  usePinch(
    ({ offset: [distance] }) => {
      setScale(Math.min(2.4, Math.max(1, 1 + distance / 200)));
    },
    { target: pinchRef },
  );

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
        Add habits or values to see your history.
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

      <div ref={pinchRef} className="overflow-hidden rounded-xl border border-border">
        <div className="flex touch-pan-x">
          <div style={{ width: LABEL_WIDTH }} className="shrink-0 bg-card">
            <div
              style={{ height: headerHeight }}
              className="flex items-center border-b border-border px-2 text-xs font-medium"
            >
              {filter === "habits" ? "Habit" : filter === "values" ? "Value" : "Habit / Value"}
            </div>
            {rows.map((row) => (
              <div
                key={row.id}
                style={{ height: rowHeight }}
                className="flex flex-col justify-center truncate border-b border-border px-2"
              >
                <span className="truncate text-xs">{row.name}</span>
                {row.category && (
                  <span className="truncate text-[9px] uppercase text-muted-foreground">
                    {row.category}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div ref={scrollRef} className="no-scrollbar flex-1 overflow-x-auto will-change-transform">
            <div
              style={{
                width: virtualizer.getTotalSize(),
                height: headerHeight + rows.length * rowHeight,
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
                      width: colWidth,
                      top: 0,
                    }}
                    className={cn(isToday && "bg-primary/5")}
                  >
                    <div
                      style={{ height: headerHeight }}
                      className={cn(
                        "flex items-center justify-center border-b border-l border-border text-[10px]",
                        isToday && "bg-primary/10 font-semibold text-primary",
                      )}
                    >
                      {formatMatrixDate(dayKey)}
                    </div>
                    {rows.map((row) => (
                      <MatrixCell
                        key={row.id}
                        row={row}
                        record={record}
                        height={rowHeight}
                        onOpenText={(name, text) => setNote({ name, text })}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Dialog open={note !== null} onOpenChange={(open) => !open && setNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{note?.name}</DialogTitle>
            </DialogHeader>
            <p className="whitespace-pre-wrap text-sm">{note?.text}</p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
