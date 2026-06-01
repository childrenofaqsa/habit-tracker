import type { Category, Habit, ValueTracker, ValueType } from "@/lib/schema";

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
): MatrixRow[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const habitRows: MatrixRow[] =
    filter === "values"
      ? []
      : habits.map((habit) => ({
          id: habit.id,
          name: habit.title,
          kind: "habit",
          category: categoryMap.get(habit.categoryId),
        }));
  const valueRows: MatrixRow[] =
    filter === "habits"
      ? []
      : values.map((value) => ({
          id: value.id,
          name: value.name,
          kind: "value",
          valueType: value.type,
        }));
  return [...habitRows, ...valueRows];
}
