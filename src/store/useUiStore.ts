import { create } from "zustand";
import type { ViewId } from "@/lib/constants";

type TrackerLogView = "month" | "week" | "list";

type UiState = {
  activeView: ViewId;
  searchQuery: string;
  valuePromptId: string | null;
  settingsOpen: boolean;
  trackerLogView: TrackerLogView;
  setActiveView: (view: ViewId) => void;
  setSearchQuery: (query: string) => void;
  openValuePrompt: (valueId: string) => void;
  closeValuePrompt: () => void;
  setSettingsOpen: (open: boolean) => void;
  setTrackerLogView: (view: TrackerLogView) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeView: "daily",
  searchQuery: "",
  valuePromptId: null,
  settingsOpen: false,
  trackerLogView: "month",
  setActiveView: (view) => set({ activeView: view, searchQuery: "" }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openValuePrompt: (valueId) => set({ valuePromptId: valueId }),
  closeValuePrompt: () => set({ valuePromptId: null }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setTrackerLogView: (view) => set({ trackerLogView: view }),
}));
