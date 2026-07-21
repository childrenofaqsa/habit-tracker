import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Habit } from "@/lib/schema";

type HabitTableRowProps = {
  habit: Habit;
  timeframeName: string;
  bestStreak: number;
  onAction: (habitId: string) => void;
};

const PRIORITY_COLORS = {
  high: "bg-red-500",
  medium: "bg-blue-500",
  low: "bg-green-500",
};

const PRIORITY_LABELS = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

export function HabitTableRow({
  habit,
  timeframeName,
  bestStreak,
  onAction,
}: HabitTableRowProps) {
  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
            {habit.imageId ? "📷" : "✦"}
          </div>
          <div>
            <span className="font-medium text-foreground">{habit.title}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "size-2 rounded-full",
                  PRIORITY_COLORS[habit.priority],
                )}
              />
              <span className="text-xs text-muted-foreground">
                {PRIORITY_LABELS[habit.priority]}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        <div>{habit.scheduledTime ?? "—"}</div>
        <div className="text-xs">
          {habit.recurrence?.includes("everyday") ? "Daily" : habit.recurrence?.join(", ") ?? "—"}
          {timeframeName && ` • ${timeframeName}`}
        </div>
      </td>
      <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">
        {habit.motivation || "—"}
      </td>
      <td className="px-4 py-3">
        <span className="font-semibold text-green-600 dark:text-green-400">
          {bestStreak > 0 ? `${bestStreak} Days` : "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onAction(habit.id)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreVertical className="size-4" />
        </button>
      </td>
    </tr>
  );
}
