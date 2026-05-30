import { todayKey } from "@/lib/date";
import type { DayRecord } from "@/lib/schema";
import type { AppSlice, HistoryActions } from "@/store/types";

function ensureToday(history: Record<string, DayRecord>): DayRecord {
  const key = todayKey();
  if (!history[key]) {
    history[key] = { habitStatus: {}, valueEntries: {} };
  }
  return history[key]!;
}

export const createHistorySlice: AppSlice<HistoryActions> = (set) => ({
  setHabitStatusToday: (habitId, status) =>
    set((draft) => {
      const day = ensureToday(draft.history);
      if (status === null) {
        delete day.habitStatus[habitId];
      } else {
        day.habitStatus[habitId] = status;
      }
    }),

  cycleHabitDone: (habitId) =>
    set((draft) => {
      const day = ensureToday(draft.history);
      if (day.habitStatus[habitId] === "done") {
        delete day.habitStatus[habitId];
      } else {
        day.habitStatus[habitId] = "done";
      }
    }),

  cycleHabitMissed: (habitId) =>
    set((draft) => {
      const day = ensureToday(draft.history);
      if (day.habitStatus[habitId] === "missed") {
        delete day.habitStatus[habitId];
      } else {
        day.habitStatus[habitId] = "missed";
      }
    }),

  setValueEntryToday: (valueId, value) =>
    set((draft) => {
      const day = ensureToday(draft.history);
      if (value === null || value === "") {
        delete day.valueEntries[valueId];
      } else {
        day.valueEntries[valueId] = value;
      }
    }),
});
