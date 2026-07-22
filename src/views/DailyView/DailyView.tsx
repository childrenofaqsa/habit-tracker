import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import { format, parse } from "date-fns";
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
  selectPickedHabits,
  isHabitVisibleOnMyDay,
} from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Reveal } from "@/common/components/motion/Reveal";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { useCelebration } from "@/common/hooks/useCelebration";
import { TimeframeSection } from "@/features/habits/components/TimeframeSection";
import { PickedHabitsRow } from "@/features/habits/components/PickedHabitsRow";
import { LinkedValueDialog } from "@/features/values/components/LinkedValueDialog";
import { CategoryFilter } from "@/features/habits/components/CategoryFilter";
import { HabitTable } from "@/features/habits/components/HabitTable";
import { EditHabitPage } from "@/features/habits/components/EditHabitPage";
import { EditModeToggle } from "@/features/editmode/EditModeToggle";
import { DateJumpButton } from "@/views/DailyView/DateJumpButton";
import { EditModeView } from "@/views/DailyView/EditModeView";
import { PickView } from "@/views/DailyView/PickView";
import type { Habit } from "@/lib/schema";

type RoutineView = "myday" | "alltask";

export function DailyView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [routineView, setRoutineView] = useState<RoutineView>("myday");
  const [picking, setPicking] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const editingHabitId = useUiStore((state) => state.editingHabitId);
  const setEditingHabitId = useUiStore((state) => state.setEditingHabitId);
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

  const dailyShowCompleted = useUiStore((state) => state.dailyShowCompleted);
  const dailyShowDiscarded = useUiStore((state) => state.dailyShowDiscarded);
  const dailyShowEmptyTimeframes = useUiStore((state) => state.dailyShowEmptyTimeframes);
  const dailyPriorityFilter = useUiStore(useShallow((state) => state.dailyPriorityFilter));
  const recentlyToggled = useUiStore(useShallow((state) => state.myDayRecentlyToggled));
  const dayStatus = useAppStore((state) => state.history[selectedDate]?.habitStatus);

  const visibleTimeframes = useMemo(() => {
    if (dailyShowEmptyTimeframes) return timeframes;
    return timeframes.filter((tf) => {
      const categoryIds = categories
        .filter((c) => c.timeframeId === tf.id)
        .map((c) => c.id);
      const timeframeHabits = habits.filter((h) => categoryIds.includes(h.categoryId));
      return timeframeHabits.some((h) =>
        isHabitVisibleOnMyDay(h, dayStatus?.[h.id], {
          showCompleted: dailyShowCompleted,
          showDiscarded: dailyShowDiscarded,
          priorities: dailyPriorityFilter,
          recentlyToggled: recentlyToggled.includes(h.id),
        }),
      );
    });
  }, [
    dailyShowEmptyTimeframes,
    dailyShowCompleted,
    dailyShowDiscarded,
    dailyPriorityFilter,
    recentlyToggled,
    timeframes,
    categories,
    habits,
    dayStatus,
  ]);

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

  if (picking) {
    return <PickView selectedDate={selectedDate} onDone={() => setPicking(false)} />;
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
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="rounded-full border border-border bg-card px-5 py-1.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  Pick
                </button>
                <div className="rounded-full border border-border bg-muted p-1">
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
                    All Habits
                  </button>
                </div>
                <DateJumpButton value={selectedDate} onChange={setSelectedDate} />
                <EditModeToggle />
              </div>
            </header>

            {searchQuery.trim() ? (
              <HabitSearchResults
                results={searchResults}
                query={searchQuery.trim()}
                onHabitAction={setEditingHabitId}
              />
            ) : routineView === "myday" ? (
              <MyDayView timeframes={visibleTimeframes} selectedDate={selectedDate} />
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
  selectedDate,
}: {
  timeframes: { id: string; name: string; order: number }[];
  selectedDate: string;
}) {
  const allPickedHabits = useAppStore(useShallow(selectPickedHabits(selectedDate)));
  const showCompleted = useUiStore((state) => state.dailyShowCompleted);
  const showDiscarded = useUiStore((state) => state.dailyShowDiscarded);
  const priorityFilter = useUiStore(useShallow((state) => state.dailyPriorityFilter));
  const recentlyToggled = useUiStore(useShallow((state) => state.myDayRecentlyToggled));
  const dayStatus = useAppStore((state) => state.history[selectedDate]?.habitStatus);

  const pickedHabits = useMemo(() => {
    return allPickedHabits.filter((h) =>
      isHabitVisibleOnMyDay(h, dayStatus?.[h.id], {
        showCompleted,
        showDiscarded,
        priorities: priorityFilter,
        recentlyToggled: recentlyToggled.includes(h.id),
      }),
    );
  }, [allPickedHabits, showCompleted, showDiscarded, priorityFilter, recentlyToggled, dayStatus]);

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
      {pickedHabits.length > 0 && (
        <Reveal>
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            <PickedHabitsRow habits={pickedHabits} />
          </section>
        </Reveal>
      )}
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
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const categories = useAppStore((state) => state.categories);
  const addCategory = useAppStore((state) => state.addCategory);
  const addHabit = useAppStore((state) => state.addHabit);

  const handleAddCategory = () => {
    const firstTimeframe = timeframes[0];
    if (!firstTimeframe) return;
    addCategory(firstTimeframe.id, "New Category");
  };

  const handleAddTask = () => {
    let targetCategoryId =
      activeCategory !== "All"
        ? categories.find((c) => c.name === activeCategory)?.id
        : undefined;
    if (!targetCategoryId) targetCategoryId = categories[0]?.id;
    if (!targetCategoryId) return;
    const id = addHabit(targetCategoryId, "New Habit");
    onHabitAction(id);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <CategoryFilter
          categories={filterCategories}
          activeCategory={activeCategory}
          onSelect={onCategoryChange}
          onAddCategory={timeframes.length > 0 ? handleAddCategory : undefined}
        />
        <button
          type="button"
          onClick={handleAddTask}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="size-4" /> Add Habit
        </button>
      </div>
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
