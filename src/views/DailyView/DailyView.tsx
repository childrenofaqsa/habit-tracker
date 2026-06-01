import { useEffect, useRef, useState } from "react";
import { CalendarPlus, GripVertical, Pencil, Calendar, Plus } from "lucide-react";
import { format, parse } from "date-fns";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import {
  selectTimeframes,
  selectTodaySummary,
  selectAllCategoryNames,
  selectHabitsByCategory,
} from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Reveal } from "@/common/components/motion/Reveal";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { useCelebration } from "@/common/hooks/useCelebration";
import { AddInline } from "@/features/editmode/AddInline";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { TimeframeSection } from "@/features/habits/components/TimeframeSection";
import { LinkedValueDialog } from "@/features/values/components/LinkedValueDialog";
import { CategoryFilter } from "@/features/habits/components/CategoryFilter";
import { HabitTable } from "@/features/habits/components/HabitTable";
import { EditHabitPage } from "@/features/habits/components/EditHabitPage";
import { FloatingActionButton } from "@/common/components/FloatingActionButton";

export function DailyView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [activeCategory, setActiveCategory] = useState("All");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const editMode = useAppStore((state) => state.settings.editMode);
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const habits = useAppStore((state) => state.habits);
  const habitCount = habits.length;
  const addTimeframe = useAppStore((state) => state.addTimeframe);
  const reorderTimeframes = useAppStore((state) => state.reorderTimeframes);
  const addHabit = useAppStore((state) => state.addHabit);
  const summary = useAppStore(useShallow(selectTodaySummary));
  const celebrate = useCelebration();
  const previousCompletion = useRef(summary.completion);
  const categoryNames = useAppStore(useShallow(selectAllCategoryNames));

  const filteredHabits = useAppStore(useShallow(selectHabitsByCategory(activeCategory)));

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

  const editingHabit = editingHabitId
    ? habits.find((h) => h.id === editingHabitId)
    : null;

  if (editingHabit) {
    return (
      <SelectedDateProvider value={selectedDate}>
        <EditHabitPage
          habit={editingHabit}
          onBack={() => setEditingHabitId(null)}
        />
      </SelectedDateProvider>
    );
  }

  if (timeframes.length === 0 && !editMode) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No timeframes yet"
        description="Turn on Edit Mode to add timeframes, categories, and habits to track each day."
      />
    );
  }

  const filterCategories = ["All", ...categoryNames];

  return (
    <SelectedDateProvider value={selectedDate}>
      <div className="space-y-5">
        {editMode ? (
          <EditModeView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            timeframes={timeframes}
            reorderTimeframes={reorderTimeframes}
            addTimeframe={addTimeframe}
            addHabit={addHabit}
          />
        ) : (
          <>
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Task</h2>
            </header>

            <CategoryFilter
              categories={filterCategories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />

            {habitCount === 0 ? (
              <EmptyState
                icon={CalendarPlus}
                title="Start tracking"
                description="Turn on Edit Mode to add your first habits."
              />
            ) : (
              <Reveal>
                <HabitTable
                  habits={filteredHabits}
                  onHabitAction={setEditingHabitId}
                />
              </Reveal>
            )}

            <FloatingActionButton
              onClick={() => {
                const firstCategory = useAppStore.getState().categories[0];
                if (firstCategory) addHabit(firstCategory.id, "New Habit");
              }}
            />
          </>
        )}
        <LinkedValueDialog />
      </div>
    </SelectedDateProvider>
  );
}

function EditModeView({
  selectedDate,
  setSelectedDate,
  timeframes,
  reorderTimeframes,
  addTimeframe,
  addHabit,
}: {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  timeframes: { id: string; name: string; order: number }[];
  reorderTimeframes: (ids: string[]) => void;
  addTimeframe: (name: string) => string;
  addHabit: (categoryId: string, title: string) => string;
}) {
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">
            {format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d")}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="rounded-xl border border-border bg-card p-2.5 shadow-sm transition-colors hover:bg-muted">
            <Calendar className="size-5 text-foreground" />
            <input
              type="date"
              className="sr-only"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => useAppStore.getState().setEditMode(false)}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Done
          </button>
        </div>
      </header>

      <DndList
        ids={timeframes.map((tf) => tf.id)}
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

      <AddInline
        label="Add Timeframe"
        placeholder="Timeframe name"
        onAdd={(name) => addTimeframe(name)}
      />

      <button
        type="button"
        onClick={() => {
          const firstCategory = useAppStore.getState().categories[0];
          if (firstCategory) addHabit(firstCategory.id, "New Habit");
        }}
        className="fixed bottom-20 right-6 z-40 flex size-16 items-center justify-center rounded-full bg-primary shadow-xl transition-transform hover:scale-110 active:scale-95"
        aria-label="Add habit"
      >
        <Plus className="size-8 text-primary-foreground" />
      </button>
    </>
  );
}
