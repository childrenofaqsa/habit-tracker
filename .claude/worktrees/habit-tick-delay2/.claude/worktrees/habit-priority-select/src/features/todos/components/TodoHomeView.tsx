import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useShallow } from "zustand/react/shallow";
import { DateScrollRow } from "@/common/components/DateScrollRow";
import { TodoCard } from "@/features/todos/components/TodoCard";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/cn";

function groupByDate(todos: ReturnType<typeof useAppStore.getState>["todos"]) {
  const map = new Map<string, typeof todos>();
  for (const t of todos) {
    const key = t.date ?? "no-date";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return map;
}

export function TodoHomeView() {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const todos = useAppStore(useShallow((s) => s.todos));
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);
  const [showAll, setShowAll] = useState(true);

  const today = todayKey();

  const sections = useMemo(() => {
    const visible = todos.filter((t) => {
      if (t.completed) return false;
      if (t.projectId) return false;
      if (showAll) return true;
      const d = t.date ?? today;
      return d === selectedDate || (d < today && selectedDate === today);
    });
    const map = groupByDate(visible);
    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === "no-date") return 1;
      if (b === "no-date") return -1;
      return a.localeCompare(b);
    });
    return keys.map((key) => {
      const isOverdue = key !== "no-date" && key < today;
      const isToday = key === today;
      let label = "Upcoming";
      let labelClass = "text-blue-500";
      if (key === "no-date") {
        label = "No date";
        labelClass = "text-muted-foreground";
      } else if (isOverdue) {
        label = "Overdue";
        labelClass = "text-red-500";
      } else if (isToday) {
        label = "Today";
        labelClass = "text-primary";
      }
      const dateLabel =
        key === "no-date" ? "" : format(parseISO(key), "EEE, MMM d, yyyy");
      return { key, label, labelClass, dateLabel, isToday, todos: map.get(key)! };
    });
  }, [todos, today, selectedDate, showAll]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-colors",
            showAll
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-muted/70",
          )}
        >
          All
        </button>
        <div className="min-w-0 flex-1">
          <DateScrollRow
            selectedDate={selectedDate}
            onDateChange={(d) => {
              setSelectedDate(d);
              setShowAll(false);
            }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditingTodoId("new")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-6">
        {sections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No tasks for the selected view.
          </div>
        )}
        {sections.map((section) => (
          <section key={section.key} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.18em]",
                  section.labelClass,
                )}
              >
                {section.label}
              </span>
              {section.dateLabel && (
                <span className="text-sm font-medium text-muted-foreground">
                  {section.dateLabel}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {section.todos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} selected={section.isToday} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
