import type { Habit, ValueTracker, ValueType } from "@/lib/schema";

export type MatrixRow = {
  id: string;
  name: string;
  kind: "habit" | "value";
  valueType?: ValueType;
};

export function buildMatrixRows(
  habits: Habit[],
  values: ValueTracker[],
): MatrixRow[] {
  const habitRows: MatrixRow[] = habits.map((habit) => ({
    id: habit.id,
    name: habit.title,
    kind: "habit",
  }));
  const valueRows: MatrixRow[] = values.map((value) => ({
    id: value.id,
    name: value.name,
    kind: "value",
    valueType: value.type,
  }));
  return [...habitRows, ...valueRows];
}
