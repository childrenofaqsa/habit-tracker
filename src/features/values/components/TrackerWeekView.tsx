import { useMemo, useState } from "react";
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
import { aggregateValueEntries, mergeTextEntries } from "@/lib/aggregate";

type Props = {
  value: ValueTracker;
  currentWeekStart: Date;
};

type EditState = {
  dateKey: string;
  dayLabel: string;
  habitId: string;
  sourceLabel: string;
} | null;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TrackerWeekView({ value, currentWeekStart }: Props) {
  const history = useAppStore((s) => s.history);
  const habits = useAppStore((s) => s.habits);
  const setValueEntry = useAppStore((s) => s.setValueEntry);
  const editMode = useAppStore((s) => s.settings.editMode);
  const [editState, setEditState] = useState<EditState>(null);
  const [draft, setDraft] = useState("");

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(currentWeekStart, i);
        return { date, dateKey: toDateKey(date), label: DAY_LABELS[i]! };
      }),
    [currentWeekStart],
  );

  const linkedHabits = useMemo(
    () => habits.filter((h) => h.linkedValueId === value.id),
    [habits, value.id],
  );

  const sources = useMemo(() => {
    const list: { id: string; label: string }[] = linkedHabits.map((h) => ({
      id: h.id,
      label: h.title,
    }));
    const hasDirect = days.some(
      ({ dateKey }) => history[dateKey]?.valueEntries[value.id]?.__direct__ !== undefined,
    );
    if (hasDirect || list.length === 0) {
      list.push({ id: "__direct__", label: "Direct" });
    }
    return list;
  }, [linkedHabits, days, history, value.id]);

  function getCell(dateKey: string, habitId: string): number | string | undefined {
    return history[dateKey]?.valueEntries[value.id]?.[habitId];
  }

  function getTotal(dateKey: string): number | string | undefined {
    const entries = history[dateKey]?.valueEntries[value.id];
    if (value.type === "text") {
      const names: Record<string, string> = {};
      for (const h of linkedHabits) names[h.id] = h.title;
      return mergeTextEntries(entries, names);
    }
    return aggregateValueEntries(entries, value.type);
  }

  function openEdit(dateKey: string, dayLabel: string, habitId: string, sourceLabel: string) {
    const existing = getCell(dateKey, habitId);
    setDraft(existing !== undefined ? String(existing) : "");
    setEditState({ dateKey, dayLabel, habitId, sourceLabel });
  }

  function handleSave() {
    if (!editState) return;
    const parsed =
      value.type === "numeric" ? (draft.trim() === "" ? null : Number(draft)) : draft;
    setValueEntry(value.id, editState.dateKey, parsed, editState.habitId);
    setEditState(null);
  }

  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-[110px_repeat(7,1fr)] gap-1">
          <div />
          {days.map(({ date, dateKey, label }) => {
            const today = isToday(date);
            return (
              <div key={dateKey} className="flex flex-col items-center gap-0.5 pb-1">
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
                    "flex size-6 items-center justify-center rounded-full text-[11px] font-bold",
                    today ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}
                >
                  {format(date, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {sources.map((source) => (
          <div
            key={source.id}
            className="grid grid-cols-[110px_repeat(7,1fr)] items-stretch gap-1"
          >
            <div className="flex items-center pr-2 text-xs font-medium leading-snug text-foreground break-words">
              {source.label}
            </div>
            {days.map(({ date, dateKey, label }) => {
              const today = isToday(date);
              const future = isFuture(date) && !today;
              const entry = getCell(dateKey, source.id);
              const hasEntry = entry !== undefined && entry !== "";
              const display = hasEntry ? String(entry) : null;
              const interactive = editMode && !future;
              const cellClass = cn(
                "flex min-h-12 w-full items-center justify-center rounded-md px-1.5 py-1.5 text-xs leading-snug transition-colors",
                today ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/30",
                interactive && "cursor-pointer hover:bg-muted",
                future && "opacity-40",
              );
              const content = display ? (
                <span className="whitespace-pre-wrap break-words text-center font-semibold text-primary">
                  {display}
                </span>
              ) : interactive ? (
                <Pencil className="size-3 text-muted-foreground/40" />
              ) : null;
              if (!interactive) {
                return (
                  <div key={dateKey} className={cellClass}>
                    {content}
                  </div>
                );
              }
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() =>
                    openEdit(dateKey, `${label} ${format(date, "d")}`, source.id, source.label)
                  }
                  className={cellClass}
                >
                  {content}
                </button>
              );
            })}
          </div>
        ))}

        <div className="grid grid-cols-[110px_repeat(7,1fr)] items-stretch gap-1 pt-1">
          <div className="flex items-center pr-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Total
          </div>
          {days.map(({ date, dateKey }) => {
            const today = isToday(date);
            const future = isFuture(date) && !today;
            const total = getTotal(dateKey);
            const display = total !== undefined && total !== "" ? String(total) : "";
            return (
              <div
                key={dateKey}
                className={cn(
                  "flex min-h-12 w-full items-center justify-center rounded-md px-1.5 py-1.5 text-xs leading-snug",
                  today ? "bg-primary/10" : "bg-muted/30",
                  future && "opacity-40",
                )}
              >
                {display ? (
                  <span className="whitespace-pre-wrap break-words text-center font-bold text-primary">
                    {display}
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Sheet open={!!editState} onOpenChange={(open) => !open && setEditState(null)}>
        <SheetContent side="bottom" className="flex flex-col gap-4 pb-8">
          <SheetHeader>
            <SheetTitle>
              {editState?.dayLabel ?? ""} · {editState?.sourceLabel ?? ""}
            </SheetTitle>
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
