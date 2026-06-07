import { todayKey } from "@/lib/date";
import type { DayRecord } from "@/lib/schema";
import type { AppSlice, HistoryActions } from "@/store/types";

function ensureToday(history: Record<string, DayRecord>): DayRecord {
  const key = todayKey();
  if (!history[key]) {
    history[key] = { habitStatus: {}, habitStatusTimes: {}, valueEntries: {} };
  } else if (!history[key]!.habitStatusTimes) {
    history[key]!.habitStatusTimes = {};
  }
  return history[key]!;
}

function nowClockTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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
        contribs[habitId] = value;
        day.valueEntries[valueId] = contribs;
      }
    }),

  setValueEntry: (valueId, dateKey, value, habitId = "__direct__") =>
    set((draft) => {
      if (!draft.history[dateKey]) {
        draft.history[dateKey] = { habitStatus: {}, habitStatusTimes: {}, valueEntries: {} };
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
