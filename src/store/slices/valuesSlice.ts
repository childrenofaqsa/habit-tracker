import { newId } from "@/lib/id";
import type { AppSlice, ValuesActions } from "@/store/types";

function applyOrder(items: { id: string; order: number }[], orderedIds: string[]): void {
  const rank = new Map(orderedIds.map((id, index) => [id, index]));
  for (const item of items) {
    const next = rank.get(item.id);
    if (next !== undefined) item.order = next;
  }
}

export const createValuesSlice: AppSlice<ValuesActions> = (set) => ({
  addValue: (name, type) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      const order = draft.values.reduce((max, v) => Math.max(max, v.order + 1), 0);
      draft.values.push({
        id,
        name,
        type,
        linkedHabitId: null,
        order,
        createdAt: now,
        updatedAt: now,
      });
    });
    return id;
  },

  updateValue: (id, patch) =>
    set((draft) => {
      const value = draft.values.find((item) => item.id === id);
      if (!value) return;
      Object.assign(value, patch);
      value.updatedAt = Date.now();
    }),

  deleteValue: (id) =>
    set((draft) => {
      draft.values = draft.values.filter((value) => value.id !== id);
      for (const habit of draft.habits) {
        if (habit.linkedValueId === id) habit.linkedValueId = null;
      }
    }),

  reorderValues: (orderedIds) =>
    set((draft) => {
      applyOrder(draft.values, orderedIds);
    }),

  linkHabitToValue: (habitId, valueId) =>
    set((draft) => {
      const habit = draft.habits.find((item) => item.id === habitId);
      if (!habit) return;
      const previous = habit.linkedValueId;
      if (previous) {
        const prevValue = draft.values.find((value) => value.id === previous);
        if (prevValue) prevValue.linkedHabitId = null;
      }
      habit.linkedValueId = valueId;
      for (const value of draft.values) {
        if (value.id === valueId) value.linkedHabitId = habitId;
        else if (value.linkedHabitId === habitId) value.linkedHabitId = null;
      }
    }),
});
