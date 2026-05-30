import { Trash2, GripVertical } from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/cn";
import type { Timeframe } from "@/lib/schema";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectCategories } from "@/store/selectors";
import { Button } from "@/common/components/ui/data/button";
import { Parallax } from "@/common/components/motion/Parallax";
import { EditableTitle } from "@/features/editmode/EditableTitle";
import { AddInline } from "@/features/editmode/AddInline";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { CategorySection } from "@/features/habits/components/CategorySection";

function isCurrentTimeframe(name: string): boolean {
  const hour = new Date().getHours();
  const normalized = name.toLowerCase();
  if (normalized.includes("morning")) return hour >= 5 && hour < 12;
  if (normalized.includes("evening")) return hour >= 12 && hour < 21;
  if (normalized.includes("night")) return hour >= 21 || hour < 5;
  return false;
}

type Props = { timeframe: Timeframe; handle?: React.ReactNode };

export function TimeframeSection({ timeframe, handle }: Props) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const categories = useAppStore(useShallow(selectCategories(timeframe.id)));
  const renameTimeframe = useAppStore((state) => state.renameTimeframe);
  const deleteTimeframe = useAppStore((state) => state.deleteTimeframe);
  const addCategory = useAppStore((state) => state.addCategory);
  const reorderCategories = useAppStore((state) => state.reorderCategories);
  const current = isCurrentTimeframe(timeframe.name);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {handle}
          <span
            className={cn(
              "size-2.5 rounded-full",
              current ? "animate-breathe bg-primary" : "bg-border",
            )}
          />
          <Parallax speed={0.06}>
            <EditableTitle
              value={timeframe.name}
              editMode={editMode}
              onRename={(name) => renameTimeframe(timeframe.id, name)}
              className="text-lg font-semibold tracking-tight"
            />
          </Parallax>
        </div>
        {editMode && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Delete timeframe"
            onClick={() => deleteTimeframe(timeframe.id)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>

      {editMode ? (
        <DndList
          ids={categories.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
          onReorder={(ids) => reorderCategories(timeframe.id, ids)}
        >
          <div className="space-y-4">
            {categories.map((category) => (
              <Sortable key={category.id} id={category.id}>
                {({ attributes, listeners }) => (
                  <CategorySection
                    category={category}
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
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>
      )}

      {editMode && (
        <AddInline
          label="Add Category"
          placeholder="Category name"
          size="sm"
          variant="secondary"
          onAdd={(name) => addCategory(timeframe.id, name)}
        />
      )}
    </section>
  );
}
