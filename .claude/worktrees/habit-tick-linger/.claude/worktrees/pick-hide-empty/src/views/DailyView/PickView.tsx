import { useCallback, useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { format, parse } from "date-fns";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import {
  selectTimeframes,
  selectPickedHabitIds,
  isHabitVisibleOnMyDay,
} from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Reveal } from "@/common/components/motion/Reveal";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { TimeframeSection } from "@/features/habits/components/TimeframeSection";
import { PickedHabitsRow } from "@/features/habits/components/PickedHabitsRow";
import { PickModeProvider } from "@/features/habits/pickMode";

/**
 * The Pick screen: mirrors My Day but with a picked-habits row at the top.
 * Tapping any habit adds/removes it from the draft pick order (instead of
 * toggling done); the draft can be reordered by dragging cards in the top row.
 * "Done" persists the order to the day record and returns to My Day.
 */
export function PickView({
  selectedDate,
  onDone,
}: {
  selectedDate: string;
  onDone: () => void;
}) {
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const habits = useAppStore((state) => state.habits);
  const categories = useAppStore((state) => state.categories);
  const setPickedHabits = useAppStore((state) => state.setPickedHabits);
  const savedPickedIds = useAppStore(useShallow(selectPickedHabitIds(selectedDate)));
  const showCompleted = useUiStore((state) => state.dailyShowCompleted);
  const showDiscarded = useUiStore((state) => state.dailyShowDiscarded);
  const showEmptyTimeframes = useUiStore((state) => state.dailyShowEmptyTimeframes);
  const priorityFilter = useUiStore(useShallow((state) => state.dailyPriorityFilter));
  const dayStatus = useAppStore((state) => state.history[selectedDate]?.habitStatus);

  // Mirror My Day's "show empty timeframes" filter: hide a timeframe when none
  // of its habits pass the active filters.
  const visibleTimeframes = useMemo(() => {
    if (showEmptyTimeframes) return timeframes;
    const filters = { showCompleted, showDiscarded, priorities: priorityFilter };
    return timeframes.filter((tf) => {
      const categoryIds = categories
        .filter((c) => c.timeframeId === tf.id)
        .map((c) => c.id);
      const timeframeHabits = habits.filter((h) => categoryIds.includes(h.categoryId));
      return timeframeHabits.some((h) =>
        isHabitVisibleOnMyDay(h, dayStatus?.[h.id], filters),
      );
    });
  }, [
    showEmptyTimeframes,
    showCompleted,
    showDiscarded,
    priorityFilter,
    timeframes,
    categories,
    habits,
    dayStatus,
  ]);

  // Local draft — only committed to the store on "Done".
  const [draftIds, setDraftIds] = useState<string[]>(savedPickedIds);

  const togglePick = useCallback((habitId: string) => {
    setDraftIds((prev) =>
      prev.includes(habitId)
        ? prev.filter((id) => id !== habitId)
        : [...prev, habitId],
    );
  }, []);

  const isPicked = useCallback(
    (habitId: string) => draftIds.includes(habitId),
    [draftIds],
  );

  const pickModeValue = useMemo(
    () => ({ pickedIds: draftIds, togglePick, isPicked }),
    [draftIds, togglePick, isPicked],
  );

  // The full picked order, resolved to habits (skipping deleted ids).
  const pickedHabits = useMemo(() => {
    const byId = new Map(habits.map((h) => [h.id, h]));
    return draftIds
      .map((id) => byId.get(id))
      .filter((h): h is NonNullable<typeof h> => h !== undefined);
  }, [draftIds, habits]);

  // Only the picked habits that pass the My Day filters are shown in the row.
  const visiblePickedHabits = useMemo(() => {
    const filters = { showCompleted, showDiscarded, priorities: priorityFilter };
    return pickedHabits.filter((h) =>
      isHabitVisibleOnMyDay(h, dayStatus?.[h.id], filters),
    );
  }, [pickedHabits, showCompleted, showDiscarded, priorityFilter, dayStatus]);

  // Reordering only shuffles the visible cards. Hidden (filtered-out) picks keep
  // their slots in the underlying draft so filtering can't silently drop them.
  const handleReorderVisible = useCallback(
    (visibleIds: string[]) => {
      setDraftIds((prev) => {
        const visibleSet = new Set(visibleIds);
        let cursor = 0;
        return prev.map((id) =>
          visibleSet.has(id) ? visibleIds[cursor++]! : id,
        );
      });
    },
    [],
  );

  const handleDone = () => {
    // Drop ids whose habit was deleted while picking.
    const validIds = new Set(habits.map((h) => h.id));
    setPickedHabits(
      selectedDate,
      draftIds.filter((id) => validIds.has(id)),
    );
    onDone();
  };

  const dateLabel = format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d");

  return (
    <SelectedDateProvider value={selectedDate}>
      <PickModeProvider value={pickModeValue}>
        <div className="space-y-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground">{dateLabel}</h2>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Pick habits for today
              </p>
            </div>
            <button
              type="button"
              onClick={handleDone}
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              Done
            </button>
          </header>

          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            <PickedHabitsRow
              habits={visiblePickedHabits}
              reorderable
              onReorder={handleReorderVisible}
            />
          </section>

          {timeframes.length === 0 ? (
            <EmptyState
              icon={CalendarPlus}
              title="No timeframes yet"
              description="Turn on Edit Mode to add timeframes, categories, and habits."
            />
          ) : (
            <div className="space-y-4">
              {visibleTimeframes.map((timeframe) => (
                <Reveal key={timeframe.id}>
                  <TimeframeSection timeframe={timeframe} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </PickModeProvider>
    </SelectedDateProvider>
  );
}
