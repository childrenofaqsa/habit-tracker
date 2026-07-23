import type {
  Category,
  DayRecord,
  Habit,
  Timeframe,
  ValueTracker,
  ValueType,
} from "@/lib/schema";

export type MatrixRow = {
  id: string;
  name: string;
  kind: "habit" | "value";
  category?: string;
  valueType?: ValueType;
};

/**
 * A collapsible section in the history matrix. Habits are grouped by category
 * name (merged across timeframes); values live in their own trailing group.
 */
export type MatrixGroup = {
  id: string;
  name: string;
  kind: "category" | "values";
  rows: MatrixRow[];
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

/**
 * Group the history rows into collapsible sections. Habits are grouped by
 * category *name* (categories that share a name across timeframes are merged),
 * with the rows inside each group kept in My Day routine order. Values are
 * collected into a single trailing group. Group order follows first appearance
 * in routine order (then values last).
 */
export function buildMatrixGroups(
  habits: Habit[],
  values: ValueTracker[],
  filter: MatrixFilter = "all",
  categories: Category[] = [],
  timeframes: Timeframe[] = [],
): MatrixGroup[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const groups: MatrixGroup[] = [];

  if (filter !== "values") {
    const byName = new Map<string, MatrixGroup>();
    for (const habit of sortHabitsByRoutine(habits, categories, timeframes)) {
      const name = categoryMap.get(habit.categoryId)?.name ?? "Uncategorized";
      let group = byName.get(name);
      if (!group) {
        group = { id: `category:${name}`, name, kind: "category", rows: [] };
        byName.set(name, group);
        groups.push(group);
      }
      group.rows.push({
        id: habit.id,
        name: habit.title,
        kind: "habit",
        category: name,
      });
    }
  }

  if (filter !== "habits") {
    const valueRows: MatrixRow[] = [...values].sort(byOrder).map((value) => ({
      id: value.id,
      name: value.name,
      kind: "value",
      valueType: value.type,
    }));
    if (valueRows.length > 0) {
      groups.push({ id: "values", name: "Values", kind: "values", rows: valueRows });
    }
  }

  return groups;
}

/**
 * Done-percentage for a category group on a given day: habits done (green tick)
 * divided by every habit in the category that day — done (green), missed (red)
 * and untracked (unknown) alike. Returns null only when the group has no habits
 * or the day has no record, so the cell can render empty. Value groups have no
 * completion figure and always return null.
 */
export function computeGroupCompletion(
  group: MatrixGroup,
  record: DayRecord | undefined,
): number | null {
  if (group.kind !== "category" || !record) return null;
  const total = group.rows.length;
  if (total === 0) return null;
  let done = 0;
  for (const row of group.rows) {
    if (record.habitStatus[row.id] === "done") done += 1;
  }
  return Math.round((done / total) * 100);
}

