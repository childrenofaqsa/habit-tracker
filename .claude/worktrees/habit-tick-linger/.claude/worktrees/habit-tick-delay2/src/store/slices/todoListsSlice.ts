import { newId } from "@/lib/id";
import type { AppSlice, TodoListsActions } from "@/store/types";

export const createTodoListsSlice: AppSlice<TodoListsActions> = (set) => ({
  addTodoList: (name) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      const maxOrder = draft.todoLists.reduce(
        (max, list) => (list.order > max ? list.order : max),
        -1,
      );
      draft.todoLists.push({
        id,
        name,
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      });
    });
    return id;
  },

  renameTodoList: (id, name) =>
    set((draft) => {
      const list = draft.todoLists.find((l) => l.id === id);
      if (!list) return;
      list.name = name;
      list.updatedAt = Date.now();
    }),

  deleteTodoList: (id) =>
    set((draft) => {
      draft.todoLists = draft.todoLists.filter((l) => l.id !== id);
      for (const todo of draft.todos) {
        if (todo.listId === id) todo.listId = null;
      }
    }),

  reorderTodoLists: (orderedIds) =>
    set((draft) => {
      const indexById = new Map(orderedIds.map((id, idx) => [id, idx]));
      for (const list of draft.todoLists) {
        const idx = indexById.get(list.id);
        if (idx !== undefined) list.order = idx;
      }
    }),
});
