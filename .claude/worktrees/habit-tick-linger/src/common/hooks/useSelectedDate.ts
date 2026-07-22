import { createContext, useContext } from "react";
import { todayKey } from "@/lib/date";
import type { DateKey } from "@/lib/date";

const SelectedDateContext = createContext<DateKey>(todayKey());

export const SelectedDateProvider = SelectedDateContext.Provider;

export function useSelectedDate(): DateKey {
  return useContext(SelectedDateContext);
}
