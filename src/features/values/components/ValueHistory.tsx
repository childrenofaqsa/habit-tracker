import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { subDays, format, startOfDay } from "date-fns";
import { toDateKey } from "@/lib/date";
import type { DateKey } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { ValueTracker } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { aggregateValueEntries, mergeTextEntries } from "@/lib/aggregate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/overlay/dialog";

type Props = { value: ValueTracker };

const CHUNK_SIZE = 30;

function getDateRange(daysBack: number): DateKey[] {
  const today = startOfDay(new Date());
  const keys: DateKey[] = [];
  for (let i = 1; i <= daysBack; i++) {
    keys.push(toDateKey(subDays(today, i)));
  }
  return keys;
}

export function ValueHistory({ value }: Props) {
  const history = useAppStore((state) => state.history);
  const habits = useAppStore((state) => state.habits);
  const [visibleDays, setVisibleDays] = useState(CHUNK_SIZE);
  const [noteDialog, setNoteDialog] = useState<{ date: string; text: string } | null>(null);

  const dates = useMemo(() => getDateRange(visibleDays), [visibleDays]);

  const habitNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const habit of habits) map[habit.id] = habit.title;
    return map;
  }, [habits]);

  const maxNumeric = useMemo(() => {
    if (value.type !== "numeric") return 1;
    let max = 1;
    for (const dateKey of dates) {
      const entry = aggregateValueEntries(history[dateKey]?.valueEntries[value.id], value.type);
      if (typeof entry === "number" && entry > max) max = entry;
    }
    return max;
  }, [dates, history, value.id, value.type]);

  const hasMoreData = useMemo(() => {
    const checkKey = toDateKey(subDays(startOfDay(new Date()), visibleDays + 1));
    return history[checkKey] !== undefined;
  }, [history, visibleDays]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">History</p>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((dateKey) => {
          const entries = history[dateKey]?.valueEntries[value.id];
          const entry =
            value.type === "text"
              ? mergeTextEntries(entries, habitNames)
              : aggregateValueEntries(entries, value.type);
          const hasEntry = entry !== undefined && entry !== 0 && entry !== "";

          if (value.type === "numeric") {
            const numValue = typeof entry === "number" ? entry : 0;
            const intensity = maxNumeric > 0 ? numValue / maxNumeric : 0;
            return (
              <div
                key={dateKey}
                title={`${format(new Date(dateKey), "MMM d")}: ${numValue}`}
                className={cn(
                  "grid size-8 place-items-center rounded-md text-[10px] font-medium",
                  hasEntry
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
                style={
                  hasEntry
                    ? { opacity: Math.max(0.4, intensity) }
                    : undefined
                }
              >
                {hasEntry ? numValue : "·"}
              </div>
            );
          }

          return (
            <button
              key={dateKey}
              type="button"
              title={format(new Date(dateKey), "MMM d")}
              disabled={!hasEntry}
              onClick={() => {
                if (typeof entry === "string" && entry) {
                  setNoteDialog({ date: format(new Date(dateKey), "MMM d, yyyy"), text: entry });
                }
              }}
              className={cn(
                "grid size-8 place-items-center rounded-md text-[10px]",
                hasEntry
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {hasEntry ? <FileText className="size-3.5" /> : "·"}
            </button>
          );
        })}
      </div>

      {hasMoreData && (
        <button
          type="button"
          onClick={() => setVisibleDays((prev) => prev + CHUNK_SIZE)}
          className="text-xs font-medium text-primary hover:underline"
        >
          Load more
        </button>
      )}

      <Dialog open={noteDialog !== null} onOpenChange={(open) => !open && setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{noteDialog?.date}</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm">{noteDialog?.text}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
