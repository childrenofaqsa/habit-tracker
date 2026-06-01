import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Todo } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { isDateKeyBeforeToday } from "@/lib/date";

type TodoCardProps = {
  todo: Todo;
};

const PRIORITY_BADGE = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export function TodoCard({ todo }: TodoCardProps) {
  const toggleTodo = useAppStore((s) => s.toggleTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);
  const overdue =
    !todo.completed && todo.date !== null && isDateKeyBeforeToday(todo.date);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors",
        overdue ? "border-red-200 dark:border-red-800/40" : "border-border",
      )}
    >
      <button
        type="button"
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
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              PRIORITY_BADGE[todo.priority],
            )}
          >
            {todo.priority}
          </span>
          {overdue && (
            <span className="text-xs font-medium text-red-500">Overdue</span>
          )}
          {todo.time && (
            <span className="text-xs text-muted-foreground">• {todo.time}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => deleteTodo(todo.id)}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
