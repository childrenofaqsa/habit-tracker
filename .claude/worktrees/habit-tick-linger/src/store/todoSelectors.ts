import { todayKey } from "@/lib/date";
import type { Todo } from "@/lib/schema";
import type { TodoSortMode } from "@/store/useUiStore";
import { format, parseISO } from "date-fns";

export type TodoBuckets = {
  todayOverdue: Todo[];
  scheduled: Todo[];
  completed: Todo[];
};

export type DateGroupedTodos = {
  label: string;
  date: string;
  isOverdue: boolean;
  isToday: boolean;
  todos: Todo[];
};

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

const byDate = (a: Todo, b: Todo) => (a.date ?? "").localeCompare(b.date ?? "");
const byManual = (a: Todo, b: Todo) => a.order - b.order;
const byCreated = (a: Todo, b: Todo) => a.createdAt - b.createdAt;
const byPriority = (a: Todo, b: Todo) => {
  const ra = a.priority ? PRIORITY_RANK[a.priority] ?? 99 : 99;
  const rb = b.priority ? PRIORITY_RANK[b.priority] ?? 99 : 99;
  return ra - rb;
};
const byTime = (a: Todo, b: Todo) => {
  const ta = a.time ?? "\uffff";
  const tb = b.time ?? "\uffff";
  return ta.localeCompare(tb);
};

export function sortTodos(todos: Todo[], mode: TodoSortMode): Todo[] {
  const copy = [...todos];
  switch (mode) {
    case "manual":
      return copy.sort(byManual);
    case "time":
      return copy.sort(byTime);
    case "priority":
      return copy.sort(byPriority);
    case "createdAt":
      return copy.sort(byCreated);
  }
}

export function buildTodoBuckets(
  todos: Todo[],
  sortMode: TodoSortMode = "manual",
): TodoBuckets {
  const today = todayKey();
  const todayOverdue: Todo[] = [];
  const scheduled: Todo[] = [];
  const completed: Todo[] = [];

  for (const todo of todos) {
    if (todo.completed) {
      completed.push(todo);
    } else if (todo.date !== null && todo.date <= today) {
      todayOverdue.push(todo);
    } else {
      scheduled.push(todo);
    }
  }

  return {
    todayOverdue:
      sortMode === "manual"
        ? sortTodos(todayOverdue, "manual")
        : sortTodos(todayOverdue, sortMode).sort(byDate),
    scheduled:
      sortMode === "manual"
        ? sortTodos(scheduled, "manual")
        : sortTodos(scheduled, sortMode).sort(byDate),
    completed: completed.sort(
      (a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0),
    ),
  };
}

export function buildDateGroupedTodos(
  todos: Todo[],
  sortMode: TodoSortMode = "manual",
): DateGroupedTodos[] {
  const today = todayKey();
  const groups: Record<string, Todo[]> = {};

  const activeTodos = todos.filter((t) => !t.completed);

  for (const todo of activeTodos) {
    const key = todo.date ?? "no-date";
    if (!groups[key]) groups[key] = [];
    groups[key].push(todo);
  }

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "no-date") return 1;
    if (b === "no-date") return -1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((key) => {
    const isOverdue = key !== "no-date" && key < today;
    const isToday = key === today;
    let label: string;
    if (key === "no-date") {
      label = "No date";
    } else if (isToday) {
      label = "Today";
    } else if (isOverdue) {
      label = "Overdue";
    } else {
      label = format(parseISO(key), "EEEE (d MMM)");
    }
    return {
      label,
      date: key,
      isOverdue,
      isToday,
      todos: sortTodos(groups[key]!, sortMode),
    };
  });
}

export function selectOverdueTodos(todos: Todo[]): Todo[] {
  const today = todayKey();
  return todos.filter((t) => !t.completed && t.date !== null && t.date < today);
}

export function selectTodosByDate(todos: Todo[], date: string): Todo[] {
  return todos.filter((t) => t.date === date && !t.completed);
}

