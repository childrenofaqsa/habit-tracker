import { create } from "zustand";
import type { ViewId } from "@/lib/constants";

type UiState = {
  activeView: ViewId;
  searchQuery: string;
  valuePromptId: string | null;
  settingsOpen: boolean;
  setActiveView: (view: ViewId) => void;
  setSearchQuery: (query: string) => void;
  openValuePrompt: (valueId: string) => void;
  closeValuePrompt: () => void;
  setSettingsOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeView: "daily",
  searchQuery: "",
  valuePromptId: null,
  settingsOpen: false,
  setActiveView: (view) => set({ activeView: view, searchQuery: "" }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openValuePrompt: (valueId) => set({ valuePromptId: valueId }),
  closeValuePrompt: () => set({ valuePromptId: null }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}));
