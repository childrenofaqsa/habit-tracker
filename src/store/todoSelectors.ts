import { todayKey } from "@/lib/date";
import type { Todo } from "@/lib/schema";

export type TodoBuckets = {
  todayOverdue: Todo[];
  scheduled: Todo[];
  inbox: Todo[];
  completed: Todo[];
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
