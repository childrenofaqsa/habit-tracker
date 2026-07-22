import { todayKey } from "@/lib/date";
import { DIRECT_KEY } from "@/lib/aggregate";
import type { DayRecord } from "@/lib/schema";
import type { AppSlice, HistoryActions, StoreState } from "@/store/types";

function ensureToday(history: Record<string, DayRecord>): DayRecord {
  const key = todayKey();
  if (!history[key]) {
    history[key] = { habitStatus: {}, habitStatusTimes: {}, valueEntries: {}, pickedHabitIds: [] };
  } else if (!history[key]!.habitStatusTimes) {
    history[key]!.habitStatusTimes = {};
  }
  return history[key]!;
}

function nowClockTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function appendToTextOverride(
  draft: StoreState,
  valueId: string,
  habitId: string,
  contribs: Record<string, number | string>,
  value: string,
): void {
  const override = contribs[DIRECT_KEY];
  if (typeof override !== "string" || override.trim().length === 0) return;
  if (draft.values.find((v) => v.id === valueId)?.type !== "text") return;
  const label = draft.habits.find((h) => h.id === habitId)?.title ?? habitId;
  contribs[DIRECT_KEY] = `${override}\n${label} : ${value}`;
}

export const createHistorySlice: AppSlice<HistoryActions> = (set) => ({
  setHabitStatusToday: (habitId, status) =>
    set((draft) => {
      const day = ensureToday(draft.history);
      const times = day.habitStatusTimes ?? (day.habitStatusTimes = {});
      if (status === null) {
        delete day.habitStatus[habitId];
        delete times[habitId];
      } else {
        day.habitStatus[habitId] = status;
        times[habitId] = nowClockTime();
      }
    }),

  cycleHabitDone: (habitId) =>
    set((draft) => {
      const day = ensureToday(draft.history);
      const times = day.habitStatusTimes ?? (day.habitStatusTimes = {});
      if (day.habitStatus[habitId] === "done") {
        delete day.habitStatus[habitId];
        delete times[habitId];
      } else {
        day.habitStatus[habitId] = "done";
        times[habitId] = nowClockTime();
      }
    }),

  cycleHabitMissed: (habitId) =>
    set((draft) => {
      const day = ensureToday(draft.history);
      const times = day.habitStatusTimes ?? (day.habitStatusTimes = {});
      if (day.habitStatus[habitId] === "missed") {
        delete day.habitStatus[habitId];
        delete times[habitId];
      } else {
        day.habitStatus[habitId] = "missed";
        times[habitId] = nowClockTime();
      }
    }),

  setValueEntryToday: (valueId, value, habitId = "__direct__") =>
    set((draft) => {
      const day = ensureToday(draft.history);
      const contribs = day.valueEntries[valueId] ?? {};
      if (value === null || value === "") {
        delete contribs[habitId];
        if (Object.keys(contribs).length === 0) {
          delete day.valueEntries[valueId];
        } else {
          day.valueEntries[valueId] = contribs;
        }
      } else {
        const isNewContribution = habitId !== DIRECT_KEY && contribs[habitId] === undefined;
        contribs[habitId] = value;
        if (isNewContribution && typeof value === "string") {
          appendToTextOverride(draft, valueId, habitId, contribs, value);
        }
        day.valueEntries[valueId] = contribs;
      }
    }),

  setPickedHabits: (dateKey, habitIds) =>
    set((draft) => {
      if (!draft.history[dateKey]) {
        draft.history[dateKey] = {
          habitStatus: {},
          habitStatusTimes: {},
          valueEntries: {},
          pickedHabitIds: [],
        };
      }
      draft.history[dateKey]!.pickedHabitIds = habitIds;
    }),

  setValueEntry: (valueId, dateKey, value, habitId = "__direct__") =>
    set((draft) => {
      if (!draft.history[dateKey]) {
        draft.history[dateKey] = { habitStatus: {}, habitStatusTimes: {}, valueEntries: {}, pickedHabitIds: [] };
      }
      const day = draft.history[dateKey]!;
      const contribs = day.valueEntries[valueId] ?? {};
      if (value === null || value === "") {
        delete contribs[habitId];
        if (Object.keys(contribs).length === 0) {
          delete day.valueEntries[valueId];
        } else {
          day.valueEntries[valueId] = contribs;
        }
      } else {
        contribs[habitId] = value;
        day.valueEntries[valueId] = contribs;
      }
    }),
});
