import { GripVertical } from "lucide-react";
import { horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectHabits } from "@/store/selectors";
import { HabitCard } from "@/features/habits/components/HabitCard/HabitCard";
import { AddHabitCard } from "@/features/habits/components/AddHabitCard";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";

export function HabitRow({ categoryId }: { categoryId: string }) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const habits = useAppStore(useShallow(selectHabits(categoryId)));
  const addHabit = useAppStore((state) => state.addHabit);
  const reorderHabits = useAppStore((state) => state.reorderHabits);

  if (!editMode) {
    return (
      <div className="no-scrollbar snap-row flex flex-row gap-3 overflow-x-auto pb-1">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
        {habits.length === 0 && (
          <p className="py-6 text-sm text-muted-foreground">No habits yet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex flex-row gap-3 overflow-x-auto pb-1">
      <DndList
        ids={habits.map((habit) => habit.id)}
        strategy={horizontalListSortingStrategy}
        onReorder={(ids) => reorderHabits(categoryId, ids)}
      >
        {habits.map((habit) => (
          <Sortable key={habit.id} id={habit.id} className="shrink-0">
            {({ attributes, listeners }) => (
              <div className="relative">
                <HabitCard habit={habit} />
                <button
                  type="button"
                  aria-label="Drag to reorder"
                  className="absolute left-1 top-1 z-10 grid size-5 cursor-grab touch-none place-items-center rounded-full bg-background/80 text-muted-foreground shadow-sm active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="size-3" />
                </button>
              </div>
            )}
          </Sortable>
        ))}
      </DndList>
      <AddHabitCard onAdd={(title) => addHabit(categoryId, title)} />
    </div>
  );
}
