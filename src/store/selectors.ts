import { todayKey, reverseChronologicalKeys } from "@/lib/date";
import type { HabitStatus } from "@/lib/schema";
import type { StoreState } from "@/store/types";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export const selectTimeframes = (state: StoreState) =>
  [...state.timeframes].sort(byOrder);

export const selectCategories = (timeframeId: string) => (state: StoreState) =>
  state.categories.filter((c) => c.timeframeId === timeframeId).sort(byOrder);

export const selectHabits = (categoryId: string) => (state: StoreState) =>
  state.habits.filter((h) => h.categoryId === categoryId).sort(byOrder);

export const selectValues = (state: StoreState) => [...state.values].sort(byOrder);

export const selectHabitStatusToday =
  (habitId: string) =>
  (state: StoreState): HabitStatus | undefined =>
    state.history[todayKey()]?.habitStatus[habitId];

export const selectValueEntryToday =
  (valueId: string) =>
  (state: StoreState): number | string | undefined =>
    state.history[todayKey()]?.valueEntries[valueId];

export type DaySummary = {
  done: number;
  missed: number;
  total: number;
  completion: number;
};

export function selectTodaySummary(state: StoreState): DaySummary {
  const record = state.history[todayKey()];
  const total = state.habits.length;
  let done = 0;
  let missed = 0;
  if (record) {
    for (const status of Object.values(record.habitStatus)) {
      if (status === "done") done += 1;
      else if (status === "missed") missed += 1;
    }
  }
  const completion = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, missed, total, completion };
}

export function selectStreak(state: StoreState): number {
  const total = state.habits.length;
  if (total === 0) return 0;
  const keys = reverseChronologicalKeys(180);
  let streak = 0;
  let index = 0;
  for (const key of keys) {
    const record = state.history[key];
    let done = 0;
    if (record) {
      for (const status of Object.values(record.habitStatus)) {
        if (status === "done") done += 1;
      }
    }
    const complete = done >= total;
    if (complete) {
      streak += 1;
    } else if (index !== 0) {
      break;
    }
    index += 1;
  }
  return streak;
}

export function selectDayCompletion(state: StoreState, dayKey: string): number {
  const record = state.history[dayKey];
  if (!record) return 0;
  let done = 0;
  let tracked = 0;
  for (const status of Object.values(record.habitStatus)) {
    tracked += 1;
    if (status === "done") done += 1;
  }
  return tracked === 0 ? 0 : Math.round((done / tracked) * 100);
}
