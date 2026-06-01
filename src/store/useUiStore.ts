import { create } from "zustand";
import type { ViewId } from "@/lib/constants";

type UiState = {
  activeView: ViewId;
  searchQuery: string;
  valuePromptId: string | null;
  setActiveView: (view: ViewId) => void;
  setSearchQuery: (query: string) => void;
  openValuePrompt: (valueId: string) => void;
  closeValuePrompt: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeView: "daily",
  searchQuery: "",
  valuePromptId: null,
  setActiveView: (view) => set({ activeView: view, searchQuery: "" }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openValuePrompt: (valueId) => set({ valuePromptId: valueId }),
  closeValuePrompt: () => set({ valuePromptId: null }),
}));
