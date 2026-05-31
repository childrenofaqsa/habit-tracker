import { useEffect, useRef, useState } from "react";
import { CalendarPlus, GripVertical, Pencil, Calendar, Plus } from "lucide-react";
import { format, parse } from "date-fns";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { selectTimeframes, selectTodaySummary } from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Reveal } from "@/common/components/motion/Reveal";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { useCelebration } from "@/common/hooks/useCelebration";
import { AddInline } from "@/features/editmode/AddInline";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { TimeframeSection } from "@/features/habits/components/TimeframeSection";
import { LinkedValueDialog } from "@/features/values/components/LinkedValueDialog";

export function DailyView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const editMode = useAppStore((state) => state.settings.editMode);
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const habitCount = useAppStore((state) => state.habits.length);
  const addTimeframe = useAppStore((state) => state.addTimeframe);
  const reorderTimeframes = useAppStore((state) => state.reorderTimeframes);
  const addHabit = useAppStore((state) => state.addHabit);
  const summary = useAppStore(useShallow(selectTodaySummary));
  const celebrate = useCelebration();
  const previousCompletion = useRef(summary.completion);

  useEffect(() => {
    if (
      previousCompletion.current < 100 &&
      summary.completion === 100 &&
      summary.total > 0
    ) {
      celebrate.dayComplete();
    }
    previousCompletion.current = summary.completion;
  }, [summary.completion, summary.total, celebrate]);

  if (timeframes.length === 0 && !editMode) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No timeframes yet"
        description="Turn on Edit Mode to add timeframes, categories, and habits to track each day."
      />
    );
  }

  return (
    <SelectedDateProvider value={selectedDate}>
      <div className="space-y-4">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-black dark:text-foreground">
              {format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d")}
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-foreground">
              Today&apos;s Journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => useAppStore.getState().toggleEditMode()}
              className="rounded-xl border border-indigo-100 bg-white p-2.5 shadow-sm transition-colors hover:bg-indigo-50 dark:border-border dark:bg-card"
              aria-label="Edit mode"
            >
              <Pencil className="size-5 text-black dark:text-foreground" />
            </button>
            <label className="rounded-xl border border-indigo-100 bg-white p-2.5 shadow-sm transition-colors hover:bg-indigo-50 dark:border-border dark:bg-card">
              <Calendar className="size-5 text-black dark:text-foreground" />
              <input
                type="date"
                className="sr-only"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              />
            </label>
          </div>
        </header>

        {habitCount === 0 && !editMode && (
          <EmptyState
            icon={CalendarPlus}
            title="Start tracking"
            description="Turn on Edit Mode to add your first habits."
          />
        )}
      {editMode ? (
        <DndList
          ids={timeframes.map((timeframe) => timeframe.id)}
          strategy={verticalListSortingStrategy}
          onReorder={reorderTimeframes}
        >
          <div className="space-y-8">
            {timeframes.map((timeframe) => (
              <Sortable key={timeframe.id} id={timeframe.id}>
                {({ attributes, listeners }) => (
                  <TimeframeSection
                    timeframe={timeframe}
                    handle={
                      <button
                        type="button"
                        aria-label="Drag to reorder"
                        className="grid size-6 cursor-grab touch-none place-items-center rounded-md text-muted-foreground active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                      >
                        <GripVertical className="size-4" />
                      </button>
                    }
                  />
                )}
              </Sortable>
            ))}
          </div>
        </DndList>
      ) : (
        timeframes.map((timeframe, index) => (
          <Reveal key={timeframe.id} delay={index * 0.05} className="lazy-section">
            <TimeframeSection timeframe={timeframe} />
          </Reveal>
        ))
      )}
      {editMode && (
        <AddInline
          label="Add Timeframe"
          placeholder="Timeframe name"
          onAdd={(name) => addTimeframe(name)}
        />
      )}
      <LinkedValueDialog />
      </div>

      {editMode && (
        <button
          type="button"
          onClick={() => {
            const firstCategory = useAppStore.getState().categories[0];
            if (firstCategory) addHabit(firstCategory.id, "New Habit");
          }}
          className="fixed bottom-20 right-6 z-40 flex size-16 items-center justify-center rounded-full bg-[#8b5cf6] shadow-xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Add habit"
        >
          <Plus className="size-8 text-white" />
        </button>
      )}
    </SelectedDateProvider>
  );
}
