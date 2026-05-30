import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { emptyAppData, type AppData } from "@/lib/schema";
import { saveAppData } from "@/storage/loadAppData";
import type { StoreState } from "@/store/types";
import { createHistorySlice } from "@/store/slices/historySlice";
import { createHabitsSlice } from "@/store/slices/habitsSlice";
import { createValuesSlice } from "@/store/slices/valuesSlice";
import { createTodosSlice } from "@/store/slices/todosSlice";
import { createSettingsSlice } from "@/store/slices/settingsSlice";
import { createSystemSlice } from "@/store/slices/systemSlice";

export const useAppStore = create<StoreState>()(
  immer((...args) => ({
    ...emptyAppData(),
    hydrated: false,
    ...createHistorySlice(...args),
    ...createHabitsSlice(...args),
    ...createValuesSlice(...args),
    ...createTodosSlice(...args),
    ...createSettingsSlice(...args),
    ...createSystemSlice(...args),
  })),
);

export function selectAppData(state: StoreState): AppData {
  return {
    version: state.version,
    timeframes: state.timeframes,
    categories: state.categories,
    habits: state.habits,
    values: state.values,
    todos: state.todos,
    history: state.history,
    settings: state.settings,
  };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

useAppStore.subscribe((state) => {
  if (!state.hydrated) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveAppData(selectAppData(useAppStore.getState()));
  }, 250);
});
