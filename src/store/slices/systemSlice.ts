import { mergeAppData } from "@/lib/merge";
import type { AppData } from "@/lib/schema";
import type { AppSlice, SystemActions } from "@/store/types";

function assignData(draft: AppData & { hydrated: boolean }, data: AppData): void {
  draft.version = data.version;
  draft.timeframes = data.timeframes;
  draft.categories = data.categories;
  draft.habits = data.habits;
  draft.values = data.values;
  draft.fields = data.fields;
  draft.entities = data.entities;
  draft.todos = data.todos;
  draft.projects = data.projects;
  draft.todoLists = data.todoLists;
  draft.history = data.history;
  draft.settings = data.settings;
}

export const createSystemSlice: AppSlice<SystemActions> = (set, get) => ({
  hydrate: (data) =>
    set((draft) => {
      assignData(draft, data);
      draft.hydrated = true;
    }),

  replaceAllData: (data) =>
    set((draft) => {
      assignData(draft, data);
    }),

  mergeData: (incoming) =>
    set((draft) => {
      const merged = mergeAppData(get(), incoming);
      assignData(draft, merged);
    }),
});
