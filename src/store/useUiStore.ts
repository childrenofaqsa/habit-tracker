import { create } from "zustand";
import type { ViewId } from "@/lib/constants";

type TrackerLogView = "month" | "week" | "list";
export type TodoSortMode = "manual" | "time" | "priority" | "createdAt";

type UiState = {
  activeView: ViewId;
  searchQuery: string;
  valuePromptId: string | null;
  valuePromptHabitId: string | null;
  settingsOpen: boolean;
  trackerLogView: TrackerLogView;
  timeframeOpen: Record<string, boolean>;
  editHideCompleted: boolean;
  editingHabitId: string | null;
  editingTodoId: string | "new" | null;
  todoSort: TodoSortMode;
  todoHideCompleted: boolean;
  analyticsHistoryOpen: boolean;
  setActiveView: (view: ViewId) => void;
  setSearchQuery: (query: string) => void;
  openValuePrompt: (valueId: string, habitId?: string | null) => void;
  closeValuePrompt: () => void;
  setSettingsOpen: (open: boolean) => void;
  setTrackerLogView: (view: TrackerLogView) => void;
  setTimeframeOpen: (id: string, open: boolean) => void;
  setEditHideCompleted: (value: boolean) => void;
  setEditingHabitId: (id: string | null) => void;
  setEditingTodoId: (id: string | "new" | null) => void;
  setTodoSort: (mode: TodoSortMode) => void;
  setTodoHideCompleted: (value: boolean) => void;
  setAnalyticsHistoryOpen: (value: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeView: "daily",
  searchQuery: "",
  valuePromptId: null,
  valuePromptHabitId: null,
  settingsOpen: false,
  trackerLogView: "month",
  timeframeOpen: {},
  editHideCompleted: false,
  editingTodoId: null,
  editingHabitId: null,
  todoSort: "manual",
  todoHideCompleted: false,
  analyticsHistoryOpen: true,
  setActiveView: (view) => set({ activeView: view, searchQuery: "" }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openValuePrompt: (valueId, habitId = null) =>
    set({ valuePromptId: valueId, valuePromptHabitId: habitId }),
  closeValuePrompt: () => set({ valuePromptId: null, valuePromptHabitId: null }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setTrackerLogView: (view) => set({ trackerLogView: view }),
  setTimeframeOpen: (id, open) =>
    set((state) => ({ timeframeOpen: { ...state.timeframeOpen, [id]: open } })),
  setEditingTodoId: (id) => set({ editingTodoId: id }),
  setEditingHabitId: (id) => set({ editingHabitId: id }),
  setEditHideCompleted: (value) => set({ editHideCompleted: value }),
  setTodoSort: (mode) => set({ todoSort: mode }),
  setTodoHideCompleted: (value) => set({ todoHideCompleted: value }),
  setAnalyticsHistoryOpen: (value) => set({ analyticsHistoryOpen: value }),
}));
