import { newId } from "@/lib/id";
import type { AppSlice, HabitsActions } from "@/store/types";

function applyOrder(items: { id: string; order: number }[], orderedIds: string[]): void {
  const rank = new Map(orderedIds.map((id, index) => [id, index]));
  for (const item of items) {
    const next = rank.get(item.id);
    if (next !== undefined) item.order = next;
  }
}

function nextOrder(items: { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order + 1), 0);
}

export const createHabitsSlice: AppSlice<HabitsActions> = (set) => ({
  addTimeframe: (name) => {
    const id = newId();
    set((draft) => {
      draft.timeframes.push({ id, name, order: nextOrder(draft.timeframes) });
    });
    return id;
  },

  renameTimeframe: (id, name) =>
    set((draft) => {
      const timeframe = draft.timeframes.find((item) => item.id === id);
      if (timeframe) timeframe.name = name;
    }),

  deleteTimeframe: (id) =>
    set((draft) => {
      const categoryIds = draft.categories
        .filter((category) => category.timeframeId === id)
        .map((category) => category.id);
      const habitIds = draft.habits
        .filter((habit) => categoryIds.includes(habit.categoryId))
        .map((habit) => habit.id);
      draft.timeframes = draft.timeframes.filter((item) => item.id !== id);
      draft.categories = draft.categories.filter(
        (category) => category.timeframeId !== id,
      );
      draft.habits = draft.habits.filter((habit) => !habitIds.includes(habit.id));
    }),

  reorderTimeframes: (orderedIds) =>
    set((draft) => {
      applyOrder(draft.timeframes, orderedIds);
    }),

  addCategory: (timeframeId, name) => {
    const id = newId();
    set((draft) => {
      const siblings = draft.categories.filter((c) => c.timeframeId === timeframeId);
      draft.categories.push({ id, timeframeId, name, order: nextOrder(siblings) });
    });
    return id;
  },

  renameCategory: (id, name) =>
    set((draft) => {
      const category = draft.categories.find((item) => item.id === id);
      if (category) category.name = name;
    }),

  deleteCategory: (id) =>
    set((draft) => {
      const habitIds = draft.habits
        .filter((habit) => habit.categoryId === id)
        .map((habit) => habit.id);
      draft.categories = draft.categories.filter((category) => category.id !== id);
      draft.habits = draft.habits.filter((habit) => !habitIds.includes(habit.id));
    }),

  reorderCategories: (timeframeId, orderedIds) =>
    set((draft) => {
      applyOrder(
        draft.categories.filter((category) => category.timeframeId === timeframeId),
        orderedIds,
      );
    }),

  addHabit: (categoryId, title) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      const siblings = draft.habits.filter((h) => h.categoryId === categoryId);
      draft.habits.push({
        id,
        categoryId,
        title,
        details: "",
        imageId: null,
        linkedValueId: null,
        priority: "medium",
        motivation: "",
        scheduledTime: null,
        recurrence: ["everyday"],
        notifications: false,
        order: nextOrder(siblings),
        createdAt: now,
        updatedAt: now,
      });
    });
    return id;
  },

  updateHabit: (id, patch) =>
    set((draft) => {
      const habit = draft.habits.find((item) => item.id === id);
      if (!habit) return;
      Object.assign(habit, patch);
      habit.updatedAt = Date.now();
    }),

  deleteHabit: (id) =>
    set((draft) => {
      draft.habits = draft.habits.filter((habit) => habit.id !== id);
      for (const value of draft.values) {
        if (value.linkedHabitId === id) value.linkedHabitId = null;
      }
    }),

  reorderHabits: (categoryId, orderedIds) =>
    set((draft) => {
      applyOrder(
        draft.habits.filter((habit) => habit.categoryId === categoryId),
        orderedIds,
      );
    }),
});
