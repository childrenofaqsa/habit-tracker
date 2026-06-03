import { useState } from "react";
import { addDays, format, isToday, isFuture } from "date-fns";
import { Pencil, Plus } from "lucide-react";
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
import { aggregateValueEntries } from "@/lib/aggregate";

type Props = {
  value: ValueTracker;
  currentWeekStart: Date;
};

type EditState = { dateKey: string; dayLabel: string } | null;

const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TrackerListView({ value, currentWeekStart }: Props) {
  const history = useAppStore((s) => s.history);
  const setValueEntry = useAppStore((s) => s.setValueEntry);
  const editMode = useAppStore((s) => s.settings.editMode);
  const [editState, setEditState] = useState<EditState>(null);
  const [draft, setDraft] = useState("");

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return { date, dateKey: toDateKey(date), abbrev: DAY_ABBREVS[i] };
  });

  function getEntry(dateKey: string): number | string | undefined {
    return aggregateValueEntries(history[dateKey]?.valueEntries[value.id], value.type);
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
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Weekly Log
      </div>
      <div className="space-y-2">
        {days.map(({ date, dateKey, abbrev }) => {
          const today = isToday(date);
          const future = isFuture(date) && !today;
          const entry = getEntry(dateKey);
          const hasEntry = entry !== undefined && entry !== "";
          const interactive = editMode && !future;

          const inner = (
            <>
              <div className="w-10 shrink-0 text-center">
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wide",
                    today ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {abbrev}
                </p>
                <p className={cn("text-base font-bold", today ? "text-primary" : "text-foreground")}>
                  {format(date, "d")}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                {hasEntry ? (
                  <p className="whitespace-pre-wrap break-words text-sm font-semibold text-foreground">
                    {String(entry)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60">
                    {future
                      ? "Future day"
                      : interactive
                        ? "No entry for this day yet. Click to log."
                        : "No entry."}
                  </p>
                )}
              </div>
              {interactive &&
                (hasEntry ? (
                  <Pencil className="size-4 shrink-0 text-muted-foreground/60" />
                ) : (
                  <Plus className="size-4 shrink-0 text-muted-foreground/60" />
                ))}
            </>
          );

          const rowClass = cn(
            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
            today
              ? "border-l-4 border-primary bg-primary/5"
              : "bg-muted/30",
            interactive && "hover:bg-muted",
            future && "opacity-40",
          );

          if (!interactive) {
            return (
              <div key={dateKey} className={rowClass}>
                {inner}
              </div>
            );
          }

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => openEdit(dateKey, `${abbrev} ${format(date, "MMM d")}`)}
              className={rowClass}
            >
              {inner}
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
