import { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Todo } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { isDateKeyBeforeToday, formatDayMonth } from "@/lib/date";

type TodoCardProps = {
  todo: Todo;
  dragHandle?: React.ReactNode;
  showDragHandle?: boolean;
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export function TodoCard({ todo, dragHandle, showDragHandle }: TodoCardProps) {
  const toggleTodo = useAppStore((s) => s.toggleTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const overdue =
    !todo.completed && todo.date !== null && isDateKeyBeforeToday(todo.date);

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
        "flex items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-colors",
        overdue ? "border-red-200 dark:border-red-800/40" : "border-border",
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
          "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
          todo.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-muted-foreground/40",
        )}
      >
        {todo.completed && <Check className="size-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            todo.completed && "text-muted-foreground line-through",
          )}
        >
          {todo.title}
        </p>
        {(todo.priority || overdue || todo.time || todo.date || todo.tag) && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {todo.priority && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  PRIORITY_BADGE[todo.priority],
                )}
              >
                {todo.priority}
              </span>
            )}
            {todo.tag && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                {todo.tag}
              </span>
            )}
            {overdue && (
              <span className="text-xs font-medium text-red-500">Overdue</span>
            )}
            {todo.date && !overdue && (
              <span className="text-xs text-muted-foreground">
                {formatDayMonth(todo.date)}
              </span>
            )}
            {todo.time && (
              <span className="text-xs text-muted-foreground">{todo.time}</span>
            )}
          </div>
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
