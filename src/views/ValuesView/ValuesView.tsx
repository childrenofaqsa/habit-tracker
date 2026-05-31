import { useState } from "react";
import { Gauge, GripVertical, Hash, Type, CalendarDays, ChevronDown, Plus } from "lucide-react";
import { format, subDays } from "date-fns";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";
import { selectValues } from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Button } from "@/common/components/ui/data/button";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { ValueRow } from "@/features/values/components/ValueRow";

function getPastDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = subDays(today, i + 1);
    return { key: format(d, "yyyy-MM-dd"), label: format(d, "MMM d") };
  });
}

export function ValuesView() {
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const editMode = useAppStore((state) => state.settings.editMode);
  const values = useAppStore(useShallow(selectValues));
  const addValue = useAppStore((state) => state.addValue);
  const reorderValues = useAppStore((state) => state.reorderValues);
  const pastDays = getPastDays(6);

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
            <h2 className="text-3xl font-extrabold text-black dark:text-foreground">Daily Updates</h2>
            <label className="mt-1 flex cursor-pointer items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-muted-foreground">
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
          {editMode && (
            <Button
              className="bg-[#633DF7] text-white shadow-sm hover:bg-[#633DF7]/90"
              onClick={() => addValue("New counter", "numeric")}
            >
              <Plus className="size-4" /> Create New
            </Button>
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <div className="grid min-w-[900px] grid-cols-[2fr_1.5fr_repeat(6,0.8fr)_0.5fr] px-8 mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <div>Habit</div>
            <div className="text-center">Today Progress</div>
            {pastDays.map((d) => (
              <div key={d.key} className="text-center">{d.label}</div>
            ))}
            <div className="text-right">History</div>
          </div>
        </div>

        {editMode ? (
          <DndList
            ids={values.map((value) => value.id)}
            strategy={verticalListSortingStrategy}
            onReorder={reorderValues}
          >
            <div className="space-y-4">
              {values.map((value) => (
                <Sortable key={value.id} id={value.id}>
                  {({ attributes, listeners }) => (
                    <ValueRow
                      value={value}
                      pastDays={pastDays}
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
          <div className="space-y-4">
            {values.map((value) => (
              <ValueRow key={value.id} value={value} pastDays={pastDays} />
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
