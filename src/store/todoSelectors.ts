import { todayKey } from "@/lib/date";
import type { Todo } from "@/lib/schema";
import { format, parseISO } from "date-fns";

export type TodoBuckets = {
  todayOverdue: Todo[];
  scheduled: Todo[];
  inbox: Todo[];
  completed: Todo[];
};

export type DateGroupedTodos = {
  label: string;
  date: string;
  isOverdue: boolean;
  isToday: boolean;
  todos: Todo[];
};

const byDate = (a: Todo, b: Todo) => (a.date ?? "").localeCompare(b.date ?? "");

export function buildTodoBuckets(todos: Todo[]): TodoBuckets {
  const today = todayKey();
  const todayOverdue: Todo[] = [];
  const scheduled: Todo[] = [];
  const inbox: Todo[] = [];
  const completed: Todo[] = [];

  for (const todo of todos) {
    if (todo.completed) {
      completed.push(todo);
    } else if (todo.date === null) {
      inbox.push(todo);
    } else if (todo.date <= today) {
      todayOverdue.push(todo);
    } else {
      scheduled.push(todo);
    }
  }

  return {
    todayOverdue: todayOverdue.sort(byDate),
    scheduled: scheduled.sort(byDate),
    inbox,
    completed: completed.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
  };
}

export function buildDateGroupedTodos(todos: Todo[]): DateGroupedTodos[] {
  const today = todayKey();
  const groups: Record<string, Todo[]> = {};

  const activeTodos = todos.filter((t) => !t.completed);

  for (const todo of activeTodos) {
    const key = todo.date ?? "inbox";
    if (!groups[key]) groups[key] = [];
    groups[key].push(todo);
  }

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "inbox") return 1;
    if (b === "inbox") return -1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((key) => {
    const isOverdue = key !== "inbox" && key < today;
    const isToday = key === today;
    let label: string;
    if (key === "inbox") {
      label = "Inbox";
    } else if (isToday) {
      label = "Today";
    } else if (isOverdue) {
      label = "Overdue";
    } else {
      label = format(parseISO(key), "EEEE (EEE, MMM d)");
    }
    return {
      label,
      date: key,
      isOverdue,
      isToday,
      todos: groups[key].sort(byDate),
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
