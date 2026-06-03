import { todayKey, reverseChronologicalKeys, parseDateKey } from "@/lib/date";
import type { Habit, HabitStatus } from "@/lib/schema";
import type { StoreState } from "@/store/types";
import { calculateBestStreak } from "@/lib/streak";
import { aggregateValueEntries, type ValueEntries } from "@/lib/aggregate";

const DAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function dayCodeFor(dateKey: string): string {
  return DAY_CODES[parseDateKey(dateKey).getDay()] ?? "sun";
}

export function isHabitScheduledOn(habit: Habit, dateKey: string): boolean {
  const recurrence = habit.recurrence ?? ["everyday"];
  if (recurrence.length === 0 || recurrence.includes("everyday")) return true;
  return recurrence.includes(dayCodeFor(dateKey));
}

export function selectScheduledHabitCount(state: StoreState, dateKey: string): number {
  let count = 0;
  for (const habit of state.habits) {
    if (isHabitScheduledOn(habit, dateKey)) count += 1;
  }
  return count;
}

export function selectScheduledCompletion(state: StoreState, dateKey: string): number {
  const record = state.history[dateKey];
  let total = 0;
  let done = 0;
  for (const habit of state.habits) {
    if (!isHabitScheduledOn(habit, dateKey)) continue;
    total += 1;
    if (record?.habitStatus[habit.id] === "done") done += 1;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

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

export const selectHabitStatus =
  (habitId: string, dateKey: string) =>
  (state: StoreState): HabitStatus | undefined =>
    state.history[dateKey]?.habitStatus[habitId];

function getValueType(state: StoreState, valueId: string) {
  return state.values.find((v) => v.id === valueId)?.type ?? "numeric";
}

export const selectValueEntryToday =
  (valueId: string) =>
  (state: StoreState): number | string | undefined =>
    aggregateValueEntries(
      state.history[todayKey()]?.valueEntries[valueId],
      getValueType(state, valueId),
    );

export const selectValueEntry =
  (valueId: string, dateKey: string) =>
  (state: StoreState): number | string | undefined =>
    aggregateValueEntries(
      state.history[dateKey]?.valueEntries[valueId],
      getValueType(state, valueId),
    );

export const selectValueEntries =
  (valueId: string, dateKey: string) =>
  (state: StoreState): ValueEntries | undefined =>
    state.history[dateKey]?.valueEntries[valueId];

export const selectValueDirectEntry =
  (valueId: string, dateKey: string) =>
  (state: StoreState): number | string | undefined =>
    state.history[dateKey]?.valueEntries[valueId]?.__direct__;

export type DaySummary = {
  done: number;
  missed: number;
  total: number;
  completion: number;
};

export function selectTodaySummary(state: StoreState): DaySummary {
  const dateKey = todayKey();
  const record = state.history[dateKey];
  let total = 0;
  let done = 0;
  let missed = 0;
  for (const habit of state.habits) {
    if (!isHabitScheduledOn(habit, dateKey)) continue;
    total += 1;
    const status = record?.habitStatus[habit.id];
    if (status === "done") done += 1;
    else if (status === "missed") missed += 1;
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

export const selectHabitsByCategory =
  (categoryName: string) => (state: StoreState) => {
    if (categoryName === "All") return [...state.habits].sort(byOrder);
    const categoryIds = state.categories
      .filter((c) => c.name.toLowerCase() === categoryName.toLowerCase())
      .map((c) => c.id);
    return state.habits
      .filter((h) => categoryIds.includes(h.categoryId))
      .sort(byOrder);
  };

export const selectBestStreak =
  (habitId: string) => (state: StoreState) =>
    calculateBestStreak(habitId, state.history);

export const selectCategoryForHabit =
  (categoryId: string) => (state: StoreState) =>
    state.categories.find((c) => c.id === categoryId);

export const selectTimeframeForCategory =
  (timeframeId: string) => (state: StoreState) =>
    state.timeframes.find((t) => t.id === timeframeId);

export const selectAllCategoryNames = (state: StoreState) => [
  ...new Set(state.categories.map((c) => c.name)),
];
