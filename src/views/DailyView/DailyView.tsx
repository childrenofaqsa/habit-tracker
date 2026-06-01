import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, GripVertical, Calendar, Plus } from "lucide-react";
import { format, parse } from "date-fns";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
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
import type { Habit } from "@/lib/schema";

type RoutineView = "myday" | "alltask";

export function DailyView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [routineView, setRoutineView] = useState<RoutineView>("myday");
  const [activeCategory, setActiveCategory] = useState("All");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const editMode = useAppStore((state) => state.settings.editMode);
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const habits = useAppStore((state) => state.habits);
  const categories = useAppStore((state) => state.categories);
  const habitCount = habits.length;
  const searchQuery = useUiStore((state) => state.searchQuery);
  const addTimeframe = useAppStore((state) => state.addTimeframe);
  const reorderTimeframes = useAppStore((state) => state.reorderTimeframes);
  const addHabit = useAppStore((state) => state.addHabit);
  const summary = useAppStore(useShallow(selectTodaySummary));
  const celebrate = useCelebration();
  const previousCompletion = useRef(summary.completion);
  const categoryNames = useAppStore(useShallow(selectAllCategoryNames));

  const filteredHabits = useAppStore(useShallow(selectHabitsByCategory(activeCategory)));

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return habits.filter((h) => {
      const categoryName = categories.find((c) => c.id === h.categoryId)?.name ?? "";
      return (
        h.title.toLowerCase().includes(q) ||
        h.details.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, habits, categories]);

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
  const dateLabel = format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d");

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
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-foreground">{dateLabel}</h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Today's Journey
                </p>
              </div>
              <div className="shrink-0 rounded-full border border-border bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setRoutineView("myday")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-sm font-semibold transition-colors",
                    routineView === "myday"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  My Day
                </button>
                <button
                  type="button"
                  onClick={() => setRoutineView("alltask")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-sm font-semibold transition-colors",
                    routineView === "alltask"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  All Task
                </button>
              </div>
            </header>

            {searchQuery.trim() ? (
              <HabitSearchResults
                results={searchResults}
                query={searchQuery.trim()}
                onHabitAction={setEditingHabitId}
              />
            ) : routineView === "myday" ? (
              <MyDayView timeframes={timeframes} />
            ) : (
              <AllTaskView
                filterCategories={filterCategories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                filteredHabits={filteredHabits}
                habitCount={habitCount}
                onHabitAction={setEditingHabitId}
              />
            )}
          </>
        )}
        <LinkedValueDialog />
      </div>
    </SelectedDateProvider>
  );
}

function HabitSearchResults({
  results,
  query,
  onHabitAction,
}: {
  results: Habit[];
  query: string;
  onHabitAction: (id: string) => void;
}) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No habits found"
        description={`No habits match "${query}".`}
      />
    );
  }
  return (
    <Reveal>
      <HabitTable habits={results} onHabitAction={onHabitAction} />
    </Reveal>
  );
}

function MyDayView({
  timeframes,
}: {
  timeframes: { id: string; name: string; order: number }[];
}) {
  if (timeframes.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No timeframes yet"
        description="Turn on Edit Mode to add timeframes, categories, and habits."
      />
    );
  }
  return (
    <div className="space-y-4">
      {timeframes.map((timeframe) => (
        <Reveal key={timeframe.id}>
          <TimeframeSection timeframe={timeframe} />
        </Reveal>
      ))}
    </div>
  );
}

function AllTaskView({
  filterCategories,
  activeCategory,
  onCategoryChange,
  filteredHabits,
  habitCount,
  onHabitAction,
}: {
  filterCategories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  filteredHabits: Habit[];
  habitCount: number;
  onHabitAction: (id: string) => void;
}) {
  return (
    <>
      <CategoryFilter
        categories={filterCategories}
        activeCategory={activeCategory}
        onSelect={onCategoryChange}
      />
      {habitCount === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Start tracking"
          description="Turn on Edit Mode to add your first habits."
        />
      ) : (
        <Reveal>
          <HabitTable habits={filteredHabits} onHabitAction={onHabitAction} />
        </Reveal>
      )}
    </>
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
