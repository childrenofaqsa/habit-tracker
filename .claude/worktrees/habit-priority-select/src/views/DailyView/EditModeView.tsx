import { Plus, GripVertical } from "lucide-react";
import { format, parse } from "date-fns";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { AddInline } from "@/features/editmode/AddInline";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { TimeframeSection } from "@/features/habits/components/TimeframeSection";
import { HabitFilterBar } from "@/features/habits/components/HabitFilterBar";
import { EditModeToggle } from "@/features/editmode/EditModeToggle";
import { DateJumpButton } from "@/views/DailyView/DateJumpButton";

type EditModeViewProps = {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  timeframes: { id: string; name: string; order: number }[];
  reorderTimeframes: (ids: string[]) => void;
  addTimeframe: (name: string) => string;
  addHabit: (categoryId: string, title: string) => string;
};

export function EditModeView({
  selectedDate,
  setSelectedDate,
  timeframes,
  reorderTimeframes,
  addTimeframe,
  addHabit,
}: EditModeViewProps) {
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">
            {format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d")}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <DateJumpButton value={selectedDate} onChange={setSelectedDate} />
          <EditModeToggle />
          <button
            type="button"
            onClick={() => useAppStore.getState().setEditMode(false)}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Done
          </button>
        </div>
      </header>

      <HabitFilterBar />

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
        onAdd={(name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          const exists = timeframes.some(
            (tf) => tf.name.trim().toLowerCase() === trimmed.toLowerCase(),
          );
          if (exists) {
            toast.error("Timeframe already exists");
            return;
          }
          addTimeframe(trimmed);
        }}
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
