import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  type SortingStrategy,
} from "@dnd-kit/sortable";

type Props = {
  ids: string[];
  strategy: SortingStrategy;
  onReorder: (ids: string[]) => void;
  children: React.ReactNode;
  mode?: "distance" | "longpress";
};

export function DndList({ ids, strategy, onReorder, children, mode = "distance" }: Props) {
  const pointerActivation =
    mode === "longpress"
      ? { delay: 250, tolerance: 5 }
      : { distance: 8 };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: pointerActivation }),
    useSensor(TouchSensor, {
      activationConstraint:
        mode === "longpress"
          ? { delay: 250, tolerance: 5 }
          : { delay: 0, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex < 0 || newIndex < 0) return;
        onReorder(arrayMove(ids, oldIndex, newIndex));
      }}
    >
      <SortableContext items={ids} strategy={strategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
