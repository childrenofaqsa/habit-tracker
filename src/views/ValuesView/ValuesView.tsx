import { useMemo, useState } from "react";
import { Gauge, GripVertical, Plus } from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { selectValues } from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { ValueRow } from "@/features/values/components/ValueRow";
import { EditUpdatePage } from "@/features/values/components/EditUpdatePage";
import { CreateTrackerPage } from "@/features/values/components/CreateTrackerPage";
import { TrackerDetailView } from "@/features/values/components/TrackerDetailView";

type ValuesScreen =
  | { type: "home" }
  | { type: "create" }
  | { type: "edit"; valueId: string }
  | { type: "detail"; valueId: string };

export function ValuesView() {
  const [screen, setScreen] = useState<ValuesScreen>({ type: "home" });
  const values = useAppStore(useShallow(selectValues));
  const reorderValues = useAppStore((s) => s.reorderValues);
  const searchQuery = useUiStore((s) => s.searchQuery);

  const filteredValues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return values;
    return values.filter(
      (v) =>
        v.name.toLowerCase().includes(q) || v.unit.toLowerCase().includes(q),
    );
  }, [values, searchQuery]);

  if (screen.type === "create") {
    return <CreateTrackerPage onBack={() => setScreen({ type: "home" })} />;
  }

  if (screen.type === "edit") {
    const value = values.find((v) => v.id === screen.valueId);
    if (!value) return <div />;
    return <EditUpdatePage value={value} onBack={() => setScreen({ type: "home" })} />;
  }

  if (screen.type === "detail") {
    const value = values.find((v) => v.id === screen.valueId);
    if (!value) return <div />;
    return <TrackerDetailView value={value} onBack={() => setScreen({ type: "home" })} />;
  }

  if (values.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tracker Updates</h2>
          <button
            type="button"
            onClick={() => setScreen({ type: "create" })}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> Create New
          </button>
        </div>
        <EmptyState
          icon={Gauge}
          title="No trackers yet"
          description="Create your first tracker to start recording daily progress."
        />
      </div>
    );
  }

  const dragEnabled = !searchQuery.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tracker Updates</h2>
        <button
          type="button"
          onClick={() => setScreen({ type: "create" })}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Create New
        </button>
      </div>

      {dragEnabled ? (
        <DndList
          ids={filteredValues.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
          onReorder={reorderValues}
        >
          <div className="space-y-4">
            {filteredValues.map((value) => (
              <Sortable key={value.id} id={value.id}>
                {({ attributes, listeners }) => (
                  <ValueRow
                    value={value}
                    dragMode
                    onNameClick={() => setScreen({ type: "edit", valueId: value.id })}
                    onLogClick={() => setScreen({ type: "detail", valueId: value.id })}
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
      ) : filteredValues.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No trackers found"
          description={`No trackers match "${searchQuery.trim()}".`}
        />
      ) : (
        <div className="space-y-4">
          {filteredValues.map((value) => (
            <ValueRow
              key={value.id}
              value={value}
              dragMode={false}
              onNameClick={() => setScreen({ type: "edit", valueId: value.id })}
              onLogClick={() => setScreen({ type: "detail", valueId: value.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
