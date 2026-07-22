import type { Category, Habit, Timeframe, ValueTracker, ValueType } from "@/lib/schema";

export type MatrixRow = {
  id: string;
  name: string;
  kind: "habit" | "value";
  category?: string;
  valueType?: ValueType;
};

export type MatrixFilter = "all" | "habits" | "values";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function sortHabitsByRoutine(
  habits: Habit[],
  categories: Category[],
  timeframes: Timeframe[],
): Habit[] {
  const orderedTimeframes = [...timeframes].sort(byOrder);
  const habitsByCategory = new Map<string, Habit[]>();
  for (const habit of habits) {
    const list = habitsByCategory.get(habit.categoryId);
    if (list) list.push(habit);
    else habitsByCategory.set(habit.categoryId, [habit]);
  }

  const ordered: Habit[] = [];
  const seen = new Set<string>();
  for (const timeframe of orderedTimeframes) {
    const tfCategories = categories
      .filter((c) => c.timeframeId === timeframe.id)
      .sort(byOrder);
    for (const category of tfCategories) {
      const bucket = habitsByCategory.get(category.id);
      if (!bucket) continue;
      for (const habit of [...bucket].sort(byOrder)) {
        ordered.push(habit);
        seen.add(habit.id);
      }
    }
  }
  for (const habit of habits) {
    if (!seen.has(habit.id)) ordered.push(habit);
  }
  return ordered;
}

export function buildMatrixRows(
  habits: Habit[],
  values: ValueTracker[],
  filter: MatrixFilter = "all",
  categories: Category[] = [],
  timeframes: Timeframe[] = [],
): MatrixRow[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const habitRows: MatrixRow[] =
    filter === "values"
      ? []
      : sortHabitsByRoutine(habits, categories, timeframes).map((habit) => ({
          id: habit.id,
          name: habit.title,
          kind: "habit",
          category: categoryMap.get(habit.categoryId)?.name,
        }));

  const valueRows: MatrixRow[] =
    filter === "habits"
      ? []
      : [...values]
          .sort(byOrder)
          .map((value) => ({
            id: value.id,
            name: value.name,
            kind: "value",
            valueType: value.type,
          }));
  return [...habitRows, ...valueRows];
}

