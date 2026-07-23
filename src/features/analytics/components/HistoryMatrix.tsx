import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePinch } from "@use-gesture/react";
import { cn } from "@/lib/cn";
import { reverseChronologicalKeys, formatMatrixDate } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import {
  buildMatrixGroups,
  computeGroupCompletion,
} from "@/features/analytics/matrixData";
import type { MatrixFilter, MatrixGroup, MatrixRow } from "@/features/analytics/matrixData";
import { MatrixCell } from "@/features/analytics/components/MatrixCell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/overlay/dialog";

type DisplayRow =
  | { kind: "group"; group: MatrixGroup }
  | { kind: "row"; row: MatrixRow };

const BASE_COL = 56;
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
  const timeframes = useAppStore((state) => state.timeframes);
  const [filter, setFilter] = useState<MatrixFilter>("all");
  const [visibleDays, setVisibleDays] = useState(Math.min(days, COLUMN_CHUNK));
  // Categories start collapsed by default; a group is only shown expanded once
  // the user explicitly opens it (expanded[group.id] === true).
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const groups = useMemo(
    () => buildMatrixGroups(habits, values, filter, categories, timeframes),
    [habits, values, filter, categories, timeframes],
  );

  const displayRows = useMemo<DisplayRow[]>(() => {
    const out: DisplayRow[] = [];
    for (const group of groups) {
      out.push({ kind: "group", group });
      if (expanded[group.id]) {
        for (const row of group.rows) out.push({ kind: "row", row });
      }
    }
    return out;
  }, [groups, expanded]);

  const toggleGroup = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

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

  if (displayRows.length === 0) {
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
            {displayRows.map((item) =>
              item.kind === "group" ? (
                <button
                  key={item.group.id}
                  type="button"
                  onClick={() => toggleGroup(item.group.id)}
                  style={{ height: rowHeight }}
                  className="flex w-full items-center gap-1 border-b border-border bg-muted/60 px-2 text-left hover:bg-muted"
                >
                  <ChevronRight
                    className={cn(
                      "size-3.5 shrink-0 text-muted-foreground transition-transform",
                      expanded[item.group.id] && "rotate-90",
                    )}
                  />
                  <span className="truncate text-xs font-semibold uppercase tracking-wide">
                    {item.group.name}
                  </span>
                </button>
              ) : (
                <div
                  key={item.row.id}
                  style={{ height: rowHeight }}
                  className="flex flex-col justify-center truncate border-b border-border px-2 pl-5"
                >
                  <span className="truncate text-xs">{item.row.name}</span>
                </div>
              ),
            )}
          </div>

          <div ref={scrollRef} className="no-scrollbar flex-1 overflow-x-auto will-change-transform">
            <div
              style={{
                width: virtualizer.getTotalSize(),
                height: headerHeight + displayRows.length * rowHeight,
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
                    {displayRows.map((item) =>
                      item.kind === "group" ? (
                        <GroupCell
                          key={item.group.id}
                          completion={computeGroupCompletion(item.group, record)}
                          height={rowHeight}
                        />
                      ) : (
                        <MatrixCell
                          key={item.row.id}
                          row={item.row}
                          record={record}
                          height={rowHeight}
                          onOpenText={(name, text) => setNote({ name, text })}
                        />
                      ),
                    )}
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

function GroupCell({
  completion,
  height,
}: {
  completion: number | null;
  height: number;
}) {
  return (
    <div
      className="flex items-center justify-center border-b border-l border-border bg-muted/60"
      style={{ height }}
    >
      {completion !== null && (
        <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
          {completion}%
        </span>
      )}
    </div>
  );
}
