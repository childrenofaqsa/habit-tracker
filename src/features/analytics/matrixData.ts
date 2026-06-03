import type { Category, Habit, Timeframe, ValueTracker, ValueType } from "@/lib/schema";

export type MatrixRow = {
  id: string;
  name: string;
  kind: "habit" | "value";
  category?: string;
  valueType?: ValueType;
};

export type MatrixFilter = "all" | "habits" | "values";

export function buildMatrixRows(
  habits: Habit[],
  values: ValueTracker[],
  filter: MatrixFilter = "all",
  categories: Category[] = [],
  timeframes: Timeframe[] = [],
): MatrixRow[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const timeframeOrder = new Map(
    timeframes.map((t, idx) => [t.id, t.order ?? idx]),
  );

  const habitRows: MatrixRow[] =
    filter === "values"
      ? []
      : [...habits]
          .sort((a, b) => {
            const catA = categoryMap.get(a.categoryId);
            const catB = categoryMap.get(b.categoryId);
            const tfA = catA ? timeframeOrder.get(catA.timeframeId) ?? 999 : 999;
            const tfB = catB ? timeframeOrder.get(catB.timeframeId) ?? 999 : 999;
            if (tfA !== tfB) return tfA - tfB;
            const coA = catA?.order ?? 999;
            const coB = catB?.order ?? 999;
            if (coA !== coB) return coA - coB;
            return a.order - b.order;
          })
          .map((habit) => ({
            id: habit.id,
            name: habit.title,
            kind: "habit",
            category: categoryMap.get(habit.categoryId)?.name,
          }));

  const valueRows: MatrixRow[] =
    filter === "habits"
      ? []
      : [...values]
          .sort((a, b) => a.order - b.order)
          .map((value) => ({
            id: value.id,
            name: value.name,
            kind: "value",
            valueType: value.type,
          }));
  return [...habitRows, ...valueRows];
}

