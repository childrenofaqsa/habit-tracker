import { Gauge, GripVertical, Hash, Type } from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectValues } from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Button } from "@/common/components/ui/data/button";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { ValueCard } from "@/features/values/components/ValueCard";

export function ValuesView() {
  const editMode = useAppStore((state) => state.settings.editMode);
  const values = useAppStore(useShallow(selectValues));
  const addValue = useAppStore((state) => state.addValue);
  const reorderValues = useAppStore((state) => state.reorderValues);

  if (values.length === 0 && !editMode) {
    return (
      <EmptyState
        icon={Gauge}
        title="No values tracked"
        description="Turn on Edit Mode to add numeric counters or text logs you can record each day."
      />
    );
  }

  return (
    <div className="space-y-4">
      {editMode ? (
        <DndList
          ids={values.map((value) => value.id)}
          strategy={verticalListSortingStrategy}
          onReorder={reorderValues}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {values.map((value) => (
              <Sortable key={value.id} id={value.id}>
                {({ attributes, listeners }) => (
                  <ValueCard
                    value={value}
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {values.map((value) => (
            <ValueCard key={value.id} value={value} />
          ))}
        </div>
      )}

      {editMode && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => addValue("New counter", "numeric")}>
            <Hash className="size-4" /> Add Counter
          </Button>
          <Button variant="secondary" onClick={() => addValue("New log", "text")}>
            <Type className="size-4" /> Add Log
          </Button>
        </div>
      )}
    </div>
  );
}
