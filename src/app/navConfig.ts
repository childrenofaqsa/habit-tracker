import { CalendarCheck, Gauge, ListTodo, BarChart3 } from "lucide-react";
import type { ViewId } from "@/lib/constants";

export type NavItem = {
  id: ViewId;
  label: string;
  icon: typeof CalendarCheck;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "daily", label: "Daily", icon: CalendarCheck },
  { id: "values", label: "Values", icon: Gauge },
  { id: "todo", label: "To-Do", icon: ListTodo },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export const VIEW_TITLES: Record<ViewId, string> = {
  daily: "Daily",
  values: "Values",
  todo: "To-Do",
  analytics: "Analytics",
};
