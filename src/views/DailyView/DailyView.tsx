import { useEffect, useRef } from "react";
import { CalendarPlus, GripVertical } from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectTimeframes, selectTodaySummary } from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import { Reveal } from "@/common/components/motion/Reveal";
import { useCelebration } from "@/common/hooks/useCelebration";
import { AddInline } from "@/features/editmode/AddInline";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { TimeframeSection } from "@/features/habits/components/TimeframeSection";
import { LinkedValueDialog } from "@/features/values/components/LinkedValueDialog";

export function DailyView() {
  const editMode = useAppStore((state) => state.settings.editMode);
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const habitCount = useAppStore((state) => state.habits.length);
  const addTimeframe = useAppStore((state) => state.addTimeframe);
  const reorderTimeframes = useAppStore((state) => state.reorderTimeframes);
  const summary = useAppStore(useShallow(selectTodaySummary));
  const celebrate = useCelebration();
  const previousCompletion = useRef(summary.completion);

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

  if (timeframes.length === 0 && !editMode) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No timeframes yet"
        description="Turn on Edit Mode to add timeframes, categories, and habits to track each day."
      />
    );
  }

  return (
    <div className="space-y-8">
      {habitCount === 0 && !editMode && (
        <EmptyState
          icon={CalendarPlus}
          title="Start tracking"
          description="Turn on Edit Mode to add your first habits."
        />
      )}
      {editMode ? (
        <DndList
          ids={timeframes.map((timeframe) => timeframe.id)}
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
      ) : (
        timeframes.map((timeframe, index) => (
          <Reveal key={timeframe.id} delay={index * 0.05}>
            <TimeframeSection timeframe={timeframe} />
          </Reveal>
        ))
      )}
      {editMode && (
        <AddInline
          label="Add Timeframe"
          placeholder="Timeframe name"
          onAdd={(name) => addTimeframe(name)}
        />
      )}
      <LinkedValueDialog />
    </div>
  );
}
