import { newId } from "@/lib/id";
import type { AppSlice, TodosActions } from "@/store/types";

export const createTodosSlice: AppSlice<TodosActions> = (set) => ({
  addTodo: (title, date) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      draft.todos.push({
        id,
        title,
        notes: "",
        date,
        completed: false,
        completedAt: null,
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
});
