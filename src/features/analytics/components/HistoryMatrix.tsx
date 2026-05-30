import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePinch } from "@use-gesture/react";
import { cn } from "@/lib/cn";
import { reverseChronologicalKeys, formatMatrixDate } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { buildMatrixRows } from "@/features/analytics/matrixData";
import { MatrixCell } from "@/features/analytics/components/MatrixCell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/overlay/dialog";

const BASE_COL = 46;
const BASE_ROW = 34;
const BASE_HEADER = 30;
const LABEL_WIDTH = 140;

export function HistoryMatrix({ days }: { days: number }) {
  const habits = useAppStore((state) => state.habits);
  const values = useAppStore((state) => state.values);
  const history = useAppStore((state) => state.history);
  const rows = buildMatrixRows(habits, values);
  const columns = reverseChronologicalKeys(days);

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
    <div ref={pinchRef} className="overflow-hidden rounded-xl border border-border">
      <div className="flex touch-pan-x">
        <div style={{ width: LABEL_WIDTH }} className="shrink-0 bg-card">
          <div
            style={{ height: headerHeight }}
            className="flex items-center border-b border-border px-2 text-xs font-medium"
          >
            Habit / Value
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              style={{ height: rowHeight }}
              className="flex items-center truncate border-b border-border px-2 text-xs"
            >
              <span className="truncate">{row.name}</span>
            </div>
          ))}
        </div>

        <div ref={scrollRef} className="no-scrollbar flex-1 overflow-x-auto">
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
                >
                  <div
                    style={{ height: headerHeight }}
                    className={cn(
                      "flex items-center justify-center border-b border-l border-border text-[10px]",
                      isToday && "animate-today-pulse font-semibold text-primary",
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
  );
}
