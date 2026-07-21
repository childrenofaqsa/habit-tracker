import { create } from "zustand";
import type { ViewId } from "@/lib/constants";
import type { Priority } from "@/lib/schema";

type TrackerLogView = "month" | "week" | "list";
export type TodoSortMode = "manual" | "time" | "priority" | "createdAt";
export type TodoTab = "todo" | "projects" | "list";

type UiState = {
  activeView: ViewId;
  searchQuery: string;
  valuePromptId: string | null;
  valuePromptHabitId: string | null;
  settingsOpen: boolean;
  trackerLogView: TrackerLogView;
  timeframeOpen: Record<string, boolean>;
  dailyShowCompleted: boolean;
  dailyShowDiscarded: boolean;
  dailyShowEmptyCategories: boolean;
  dailyShowEmptyTimeframes: boolean;
  dailyPriorityFilter: Priority[];
  /**
   * Habit IDs that were just toggled on My Day and are held visible for a short
   * grace period before the completed/discarded filters hide them, so the user
   * can see what they ticked (green or red) before it filters out.
   */
  myDayRecentlyToggled: string[];
  editingHabitId: string | null;
  editingTodoId: string | "new" | null;
  todoSort: TodoSortMode;
  todoHideCompleted: boolean;
  todoTab: TodoTab;
  expandedProjectId: string | null;
  editingProjectId: string | "new" | null;
  activeTodoListId: string | null;
  creatingTodoListId: string | null;
  analyticsHistoryOpen: boolean;
  analyticsTimeLogOpen: boolean;
  setActiveView: (view: ViewId) => void;
  setSearchQuery: (query: string) => void;
  openValuePrompt: (valueId: string, habitId?: string | null) => void;
  closeValuePrompt: () => void;
  setSettingsOpen: (open: boolean) => void;
  setTrackerLogView: (view: TrackerLogView) => void;
  setTimeframeOpen: (id: string, open: boolean) => void;
  setDailyShowCompleted: (value: boolean) => void;
  setDailyShowDiscarded: (value: boolean) => void;
  setDailyShowEmptyCategories: (value: boolean) => void;
  setDailyShowEmptyTimeframes: (value: boolean) => void;
  toggleDailyPriorityFilter: (priority: Priority) => void;
  markMyDayRecentlyToggled: (habitId: string) => void;
  clearMyDayRecentlyToggled: (habitId: string) => void;
  setEditingHabitId: (id: string | null) => void;
  setEditingTodoId: (id: string | "new" | null) => void;
  setTodoSort: (mode: TodoSortMode) => void;
  setTodoHideCompleted: (value: boolean) => void;
  setTodoTab: (tab: TodoTab) => void;
  setExpandedProjectId: (id: string | null) => void;
  setEditingProjectId: (id: string | "new" | null) => void;
  setActiveTodoListId: (id: string | null) => void;
  setCreatingTodoListId: (id: string | null) => void;
  setAnalyticsHistoryOpen: (value: boolean) => void;
  setAnalyticsTimeLogOpen: (value: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeView: "daily",
  searchQuery: "",
  valuePromptId: null,
  valuePromptHabitId: null,
  settingsOpen: false,
  trackerLogView: "month",
  timeframeOpen: {},
  dailyShowCompleted: true,
  dailyShowDiscarded: true,
  dailyShowEmptyCategories: true,
  dailyShowEmptyTimeframes: true,
  dailyPriorityFilter: [],
  myDayRecentlyToggled: [],
  editingTodoId: null,
  editingHabitId: null,
  todoSort: "manual",
  todoHideCompleted: false,
  todoTab: "todo",
  expandedProjectId: null,
  editingProjectId: null,
  activeTodoListId: null,
  creatingTodoListId: null,
  analyticsHistoryOpen: true,
  analyticsTimeLogOpen: true,
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
  setDailyShowCompleted: (value) => set({ dailyShowCompleted: value }),
  setDailyShowDiscarded: (value) => set({ dailyShowDiscarded: value }),
  setDailyShowEmptyCategories: (value) => set({ dailyShowEmptyCategories: value }),
  setDailyShowEmptyTimeframes: (value) => set({ dailyShowEmptyTimeframes: value }),
  toggleDailyPriorityFilter: (priority) =>
    set((state) => ({
      dailyPriorityFilter: state.dailyPriorityFilter.includes(priority)
        ? state.dailyPriorityFilter.filter((p) => p !== priority)
        : [...state.dailyPriorityFilter, priority],
    })),
  markMyDayRecentlyToggled: (habitId) =>
    set((state) =>
      state.myDayRecentlyToggled.includes(habitId)
        ? state
        : { myDayRecentlyToggled: [...state.myDayRecentlyToggled, habitId] },
    ),
  clearMyDayRecentlyToggled: (habitId) =>
    set((state) =>
      state.myDayRecentlyToggled.includes(habitId)
        ? {
            myDayRecentlyToggled: state.myDayRecentlyToggled.filter(
              (id) => id !== habitId,
            ),
          }
        : state,
    ),
  setTodoSort: (mode) => set({ todoSort: mode }),
  setTodoHideCompleted: (value) => set({ todoHideCompleted: value }),
  setTodoTab: (tab) => set({ todoTab: tab }),
  setExpandedProjectId: (id) => set({ expandedProjectId: id }),
  setEditingProjectId: (id) => set({ editingProjectId: id }),
  setActiveTodoListId: (id) => set({ activeTodoListId: id }),
  setCreatingTodoListId: (id) => set({ creatingTodoListId: id }),
  setAnalyticsHistoryOpen: (value) => set({ analyticsHistoryOpen: value }),
  setAnalyticsTimeLogOpen: (value) => set({ analyticsTimeLogOpen: value }),
}));
