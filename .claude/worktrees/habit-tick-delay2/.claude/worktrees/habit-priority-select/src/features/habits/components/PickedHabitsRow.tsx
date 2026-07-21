import { GripVertical, Star } from "lucide-react";
import { horizontalListSortingStrategy } from "@dnd-kit/sortable";
import type { Habit } from "@/lib/schema";
import { HabitCard } from "@/features/habits/components/HabitCard/HabitCard";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";

function SectionHeading() {
  return (
    <div className="mb-4 flex items-center gap-1.5">
      <Star className="size-3.5 text-primary" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-foreground">
        Picked Habits
      </span>
    </div>
  );
}

/**
 * The picked-habits row shown above all timeframes.
 *
 * - On the main My Day screen (`reorderable={false}`) the cards behave exactly
 *   like regular habit cards — tap toggles done, long-press marks missed — and
 *   because status is keyed by habit id + date, that change is shared with the
 *   habit's own timeframe card.
 * - On the Pick screen (`reorderable`) cards are draggable to set the order and
 *   live inside a PickModeProvider, so tapping one removes it from the pick.
 */
export function PickedHabitsRow({
  habits,
  reorderable = false,
  onReorder,
}: {
  habits: Habit[];
  reorderable?: boolean;
  onReorder?: (orderedIds: string[]) => void;
}) {
  if (habits.length === 0) {
    if (!reorderable) return null;
    return (
      <div>
        <SectionHeading />
        <p className="py-6 text-sm text-muted-foreground">
          Tap habits below to add them here.
        </p>
      </div>
    );
  }

  if (!reorderable) {
    return (
      <div>
        <SectionHeading />
        <div className="no-scrollbar snap-row flex flex-row gap-1 overflow-x-auto pb-1">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeading />
      <div className="no-scrollbar flex flex-row gap-1 overflow-x-auto pb-1">
        <DndList
          ids={habits.map((habit) => habit.id)}
          strategy={horizontalListSortingStrategy}
          onReorder={(ids) => onReorder?.(ids)}
          mode="longpress"
        >
          {habits.map((habit) => (
            <Sortable key={habit.id} id={habit.id} className="shrink-0">
              {({ attributes, listeners }) => (
                <div className="relative">
                  <HabitCard habit={habit} />
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    className="absolute left-1 top-1 z-20 grid size-5 cursor-grab touch-none place-items-center rounded-full bg-background/80 text-muted-foreground shadow-sm active:cursor-grabbing"
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
      </div>
    </div>
  );
}
