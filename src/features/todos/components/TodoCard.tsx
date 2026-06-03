import { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Todo } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { isDateKeyBeforeToday, todayKey, formatDayMonth } from "@/lib/date";

type TodoCardProps = {
  todo: Todo;
  dragHandle?: React.ReactNode;
  showDragHandle?: boolean;
  selected?: boolean;
};

export function TodoCard({ todo, dragHandle, showDragHandle, selected }: TodoCardProps) {
  const toggleTodo = useAppStore((s) => s.toggleTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const overdue =
    !todo.completed && todo.date !== null && isDateKeyBeforeToday(todo.date);
  const isToday = todo.date === todayKey();

  let subLabel = "";
  let subClass = "text-muted-foreground";
  if (overdue) {
    subLabel = "OVERDUE";
    subClass = "text-red-500 font-bold";
  } else if (isToday) {
    subLabel = "Today";
    subClass = "text-primary";
  } else if (todo.date) {
    subLabel = formatDayMonth(todo.date);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm transition-colors",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      {showDragHandle &&
        (dragHandle ?? (
          <span className="text-muted-foreground/50">
            <GripVertical className="size-4" />
          </span>
        ))}

      <button
        type="button"
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        onClick={() => toggleTodo(todo.id)}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors",
          todo.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-muted-foreground/40 bg-card hover:border-primary/60",
        )}
      >
        {todo.completed && <Check className="size-4" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-bold leading-tight",
            todo.completed && "text-muted-foreground line-through",
          )}
        >
          {todo.title}
        </p>
        {subLabel && (
          <p className={cn("mt-0.5 text-[11px] tracking-wide", subClass)}>
            {subLabel}
          </p>
        )}
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="Task menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreVertical className="size-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setEditingTodoId(todo.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <Pencil className="size-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                deleteTodo(todo.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
