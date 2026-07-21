import type { DayRecord } from "./schema";
import { format, subDays } from "date-fns";

export function calculateBestStreak(
  habitId: string,
  history: Record<string, DayRecord>,
): number {
  const sortedDates = Object.keys(history).sort();
  if (sortedDates.length === 0) return 0;

  let bestStreak = 0;
  let currentStreak = 0;

  for (const date of sortedDates) {
    const status = history[date]?.habitStatus[habitId];
    if (status === "done") {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
}

export function calculateCurrentStreak(
  habitId: string,
  history: Record<string, DayRecord>,
): number {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    const status = history[date]?.habitStatus[habitId];
    if (status === "done") {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}
