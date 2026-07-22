import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";

type SortableReturn = ReturnType<typeof useSortable>;

type HandleProps = {
  attributes: SortableReturn["attributes"];
  listeners: SortableReturn["listeners"];
  isDragging: boolean;
};

type Props = {
  id: string;
  className?: string;
  children: (handle: HandleProps) => React.ReactNode;
};

export function Sortable({ id, className, children }: Props) {
  const { setNodeRef, transform, transition, attributes, listeners, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(className, isDragging && "z-20 opacity-70")}
    >
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}
