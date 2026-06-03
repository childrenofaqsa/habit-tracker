import { newId } from "@/lib/id";
import type { AppSlice, TodosActions } from "@/store/types";

export const createTodosSlice: AppSlice<TodosActions> = (set) => ({
  addTodo: (input) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      const maxOrder = draft.todos.reduce(
        (max, todo) => (todo.order > max ? todo.order : max),
        -1,
      );
      draft.todos.push({
        id,
        title: input.title,
        notes: input.notes ?? "",
        date: input.date ?? null,
        priority: input.priority ?? null,
        tag: input.tag ?? "",
        time: input.time ?? null,
        location: input.location ?? null,
        completed: false,
        completedAt: null,
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      });
    });
    return id;
  },

  updateTodo: (id, patch) =>
    set((draft) => {
      const todo = draft.todos.find((item) => item.id === id);
      if (!todo) return;
      Object.assign(todo, patch);
      todo.updatedAt = Date.now();
    }),

  deleteTodo: (id) =>
    set((draft) => {
      draft.todos = draft.todos.filter((todo) => todo.id !== id);
    }),

  toggleTodo: (id) =>
    set((draft) => {
      const todo = draft.todos.find((item) => item.id === id);
      if (!todo) return;
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? Date.now() : null;
      todo.updatedAt = Date.now();
    }),

  reorderTodos: (orderedIds) =>
    set((draft) => {
      const indexById = new Map(orderedIds.map((id, idx) => [id, idx]));
      for (const todo of draft.todos) {
        const idx = indexById.get(todo.id);
        if (idx !== undefined) todo.order = idx;
      }
    }),
});
