import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectTimeframes } from "@/store/selectors";
import type { Habit } from "@/lib/schema";
import { HabitTableRow } from "./HabitTableRow";

type HabitTableProps = {
  habits: Habit[];
  onHabitAction: (habitId: string) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  health: "text-green-600 dark:text-green-400",
  mind: "text-blue-600 dark:text-blue-400",
  productivity: "text-emerald-600 dark:text-emerald-400",
  creativity: "text-purple-600 dark:text-purple-400",
  "self-care": "text-pink-600 dark:text-pink-400",
};

function getCategoryColor(name: string) {
  return CATEGORY_COLORS[name.toLowerCase()] ?? "text-muted-foreground";
}

export function HabitTable({ habits, onHabitAction }: HabitTableProps) {
  const categories = useAppStore((s) => s.categories);
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const history = useAppStore((s) => s.history);

  const habitsByCategory = new Map<string, Habit[]>();
  for (const habit of habits) {
    const cat = categories.find((c) => c.id === habit.categoryId);
    const catName = cat?.name ?? "Uncategorized";
    if (!habitsByCategory.has(catName)) habitsByCategory.set(catName, []);
    habitsByCategory.get(catName)!.push(habit);
  }

  function getTimeframeName(habit: Habit) {
    const cat = categories.find((c) => c.id === habit.categoryId);
    if (!cat) return "";
    const tf = timeframes.find((t) => t.id === cat.timeframeId);
    return tf?.name ?? "";
  }

  function getBestStreak(habitId: string) {
    const sortedDates = Object.keys(history).sort();
    let best = 0;
    let current = 0;
    for (const date of sortedDates) {
      if (history[date]?.habitStatus[habitId] === "done") {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return best;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Habit
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Schedule
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Motivation
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Best Streak
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {[...habitsByCategory.entries()].map(([categoryName, categoryHabits]) => (
            <CategoryGroup
              key={categoryName}
              categoryName={categoryName}
              habits={categoryHabits}
              getTimeframeName={getTimeframeName}
              getBestStreak={getBestStreak}
              onAction={onHabitAction}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryGroup({
  categoryName,
  habits,
  getTimeframeName,
  getBestStreak,
  onAction,
}: {
  categoryName: string;
  habits: Habit[];
  getTimeframeName: (h: Habit) => string;
  getBestStreak: (id: string) => number;
  onAction: (id: string) => void;
}) {
  return (
    <>
      <tr>
        <td colSpan={5} className="px-4 pb-1 pt-4">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${getCategoryColor(categoryName)}`}
          >
            {categoryName}
          </span>
        </td>
      </tr>
      {habits.map((habit) => (
        <HabitTableRow
          key={habit.id}
          habit={habit}
          timeframeName={getTimeframeName(habit)}
          bestStreak={getBestStreak(habit.id)}
          onAction={onAction}
        />
      ))}
    </>
  );
}
