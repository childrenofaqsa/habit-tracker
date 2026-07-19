import { createContext, useContext } from "react";

export type PickModeContextValue = {
  /** Ordered ids of habits currently picked in the draft. */
  pickedIds: string[];
  /** Add the habit to the end of the pick order, or remove it if already picked. */
  togglePick: (habitId: string) => void;
  isPicked: (habitId: string) => boolean;
};

const PickModeContext = createContext<PickModeContextValue | null>(null);

export const PickModeProvider = PickModeContext.Provider;

/**
 * Returns the active pick-mode controls, or null when not in the Pick screen.
 * Habit cards use this to decide whether a tap picks a habit (Pick screen) or
 * toggles its done status (normal My Day).
 */
export function usePickMode(): PickModeContextValue | null {
  return useContext(PickModeContext);
}
