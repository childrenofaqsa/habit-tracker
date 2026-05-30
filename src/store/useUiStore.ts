import { create } from "zustand";
import type { ViewId } from "@/lib/constants";

type UiState = {
  activeView: ViewId;
  valuePromptId: string | null;
  setActiveView: (view: ViewId) => void;
  openValuePrompt: (valueId: string) => void;
  closeValuePrompt: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeView: "daily",
  valuePromptId: null,
  setActiveView: (view) => set({ activeView: view }),
  openValuePrompt: (valueId) => set({ valuePromptId: valueId }),
  closeValuePrompt: () => set({ valuePromptId: null }),
}));
