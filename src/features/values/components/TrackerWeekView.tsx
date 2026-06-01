import { useState } from "react";
import { format, addDays, isToday, isFuture } from "date-fns";
import { Pencil } from "lucide-react";
import type { ValueTracker } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/overlay/sheet";
import { toDateKey } from "@/lib/date";

type Props = {
  value: ValueTracker;
  currentWeekStart: Date;
};

type EditState = { dateKey: string; dayLabel: string } | null;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TrackerWeekView({ value, currentWeekStart }: Props) {
  const history = useAppStore((s) => s.history);
  const setValueEntry = useAppStore((s) => s.setValueEntry);
  const [editState, setEditState] = useState<EditState>(null);
  const [draft, setDraft] = useState("");

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return { date, dateKey: toDateKey(date), label: DAY_LABELS[i] };
  });

  function getEntry(dateKey: string): number | string | undefined {
    return history[dateKey]?.valueEntries[value.id];
  }

  function openEdit(dateKey: string, dayLabel: string) {
    const existing = getEntry(dateKey);
    setDraft(existing !== undefined ? String(existing) : "");
    setEditState({ dateKey, dayLabel });
  }

  function handleSave() {
    if (!editState) return;
    const parsed =
      value.type === "numeric" ? (draft.trim() === "" ? null : Number(draft)) : draft;
    setValueEntry(value.id, editState.dateKey, parsed);
    setEditState(null);
  }

  return (
    <>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, dateKey, label }) => {
          const today = isToday(date);
          const future = isFuture(date) && !today;
          const entry = getEntry(dateKey);
          const hasEntry = entry !== undefined && entry !== "";
          const display = hasEntry ? String(entry).slice(0, 5) : null;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={future}
              onClick={() => !future && openEdit(dateKey, `${label} ${format(date, "d")}`)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-3 text-center transition-colors",
                today
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "bg-muted/30 hover:bg-muted",
                future && "opacity-40 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wide",
                  today ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                  today ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                {format(date, "d")}
              </div>
              {display ? (
                <span className="text-[10px] font-semibold text-primary">{display}</span>
              ) : !future ? (
                <Pencil className="size-3 text-muted-foreground/40" />
              ) : null}
            </button>
          );
        })}
      </div>

      <Sheet open={!!editState} onOpenChange={(open) => !open && setEditState(null)}>
        <SheetContent side="bottom" className="flex flex-col gap-4 pb-8">
          <SheetHeader>
            <SheetTitle>{editState?.dayLabel ?? ""}</SheetTitle>
          </SheetHeader>
          {value.type === "numeric" ? (
            <input
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Enter ${value.unit || "value"}...`}
              className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          ) : (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your log entry..."
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
