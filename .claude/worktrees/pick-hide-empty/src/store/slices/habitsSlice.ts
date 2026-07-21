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

function nameEquals(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export const createHabitsSlice: AppSlice<HabitsActions> = (set, get) => ({
  addTimeframe: (name) => {
    const trimmed = name.trim();
    const existing = get().timeframes.find((tf) => nameEquals(tf.name, trimmed));
    if (existing) return existing.id;
    const id = newId();
    set((draft) => {
      draft.timeframes.push({ id, name: trimmed, order: nextOrder(draft.timeframes) });
    });
    return id;
  },

  renameTimeframe: (id, name) =>
    set((draft) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const collision = draft.timeframes.some(
        (tf) => tf.id !== id && nameEquals(tf.name, trimmed),
      );
      if (collision) return;
      const timeframe = draft.timeframes.find((item) => item.id === id);
      if (timeframe) timeframe.name = trimmed;
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
    const trimmed = name.trim();
    const existing = get().categories.find(
      (c) => c.timeframeId === timeframeId && nameEquals(c.name, trimmed),
    );
    if (existing) return existing.id;
    const id = newId();
    set((draft) => {
      const siblings = draft.categories.filter((c) => c.timeframeId === timeframeId);
      draft.categories.push({ id, timeframeId, name: trimmed, order: nextOrder(siblings) });
    });
    return id;
  },

  renameCategory: (id, name) =>
    set((draft) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const target = draft.categories.find((item) => item.id === id);
      if (!target) return;
      const collision = draft.categories.some(
        (c) =>
          c.id !== id &&
          c.timeframeId === target.timeframeId &&
          nameEquals(c.name, trimmed),
      );
      if (collision) return;
      target.name = trimmed;
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

  moveCategoryToTimeframe: (categoryId, timeframeId) =>
    set((draft) => {
      const category = draft.categories.find((item) => item.id === categoryId);
      if (!category || category.timeframeId === timeframeId) return;
      const collision = draft.categories.some(
        (c) =>
          c.id !== categoryId &&
          c.timeframeId === timeframeId &&
          nameEquals(c.name, category.name),
      );
      if (collision) return;
      const siblings = draft.categories.filter((c) => c.timeframeId === timeframeId);
      category.timeframeId = timeframeId;
      category.order = nextOrder(siblings);
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
