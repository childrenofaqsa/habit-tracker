import { useMemo, useState } from "react";
import { Gauge, GripVertical, Hash, Type, CalendarDays, ChevronDown, Plus } from "lucide-react";
import { format, subDays } from "date-fns";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { selectValues } from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Button } from "@/common/components/ui/data/button";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { ValueRow } from "@/features/values/components/ValueRow";
import { EditUpdatePage } from "@/features/values/components/EditUpdatePage";

function getPastDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = subDays(today, i + 1);
    return { key: format(d, "yyyy-MM-dd"), label: format(d, "MMM d") };
  });
}

export function ValuesView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const editMode = useAppStore((state) => state.settings.editMode);
  const values = useAppStore(useShallow(selectValues));
  const addValue = useAppStore((state) => state.addValue);
  const reorderValues = useAppStore((state) => state.reorderValues);
  const pastDays = getPastDays(6);
  const searchQuery = useUiStore((state) => state.searchQuery);

  const filteredValues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return values;
    return values.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.unit.toLowerCase().includes(q),
    );
  }, [values, searchQuery]);

  const editingValue = editingValueId
    ? values.find((v) => v.id === editingValueId)
    : null;

  if (editingValue) {
    return (
      <EditUpdatePage
        value={editingValue}
        onBack={() => setEditingValueId(null)}
      />
    );
  }

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
    <SelectedDateProvider value={selectedDate}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Daily Updates</h2>
            <label className="mt-1 flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
              <CalendarDays className="size-4" />
              <span className="text-sm font-medium">
                {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
              </span>
              <ChevronDown className="size-4" />
              <input
                type="date"
                className="sr-only"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              />
            </label>
          </div>
          <Button
            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            onClick={() => addValue("New counter", "numeric")}
          >
            <Plus className="size-4" /> Create New
          </Button>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <div className="grid min-w-[900px] grid-cols-[2fr_1.5fr_repeat(6,0.8fr)_0.5fr] px-8 mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <div>Habit</div>
            <div className="text-center">Today Progress</div>
            {pastDays.map((d) => (
              <div key={d.key} className="text-center">{d.label}</div>
            ))}
            <div className="text-right">History</div>
          </div>
        </div>

        {editMode && !searchQuery.trim() ? (
          <DndList
            ids={filteredValues.map((value) => value.id)}
            strategy={verticalListSortingStrategy}
            onReorder={reorderValues}
          >
            <div className="space-y-4">
              {filteredValues.map((value) => (
                <Sortable key={value.id} id={value.id}>
                  {({ attributes, listeners }) => (
                    <ValueRow
                      value={value}
                      pastDays={pastDays}
                      onEdit={() => setEditingValueId(value.id)}
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
        ) : filteredValues.length === 0 && searchQuery.trim() ? (
          <EmptyState
            icon={Gauge}
            title="No values found"
            description={`No values match "${searchQuery.trim()}".`}
          />
        ) : (
          <div className="space-y-4">
            {filteredValues.map((value) => (
              <ValueRow
                key={value.id}
                value={value}
                pastDays={pastDays}
                onEdit={() => setEditingValueId(value.id)}
              />
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
    </SelectedDateProvider>
  );
}
