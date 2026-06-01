import { CalendarCheck, ListChecks, RefreshCw, BarChart2, Settings, HelpCircle } from "lucide-react";
import type { ViewId } from "@/lib/constants";

export type NavItem = {
  id: ViewId;
  label: string;
  icon: typeof CalendarCheck;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "daily", label: "Routine", icon: CalendarCheck },
  { id: "todo", label: "To Do", icon: ListChecks },
  { id: "values", label: "Update", icon: RefreshCw },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
];

export const VIEW_TITLES: Record<ViewId, string> = {
  daily: "Routine",
  values: "Update",
  todo: "To Do",
  analytics: "Analytics",
};
