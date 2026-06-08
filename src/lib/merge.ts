import type { AppData, DayRecord } from "@/lib/schema";

type Identified = { id: string };
type Timestamped = Identified & { updatedAt: number };

function mergeById<T extends Identified>(current: T[], incoming: T[]): T[] {
  const map = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values());
}

function mergeByUpdatedAt<T extends Timestamped>(current: T[], incoming: T[]): T[] {
  const map = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    const existing = map.get(item.id);
    if (!existing || item.updatedAt > existing.updatedAt) map.set(item.id, item);
  }
  return Array.from(map.values());
}

function mergeValueEntries(
  current: Record<string, Record<string, number | string>>,
  incoming: Record<string, Record<string, number | string>>,
): Record<string, Record<string, number | string>> {
  const merged: Record<string, Record<string, number | string>> = { ...current };
  for (const [valueId, contribs] of Object.entries(incoming)) {
    merged[valueId] = { ...(merged[valueId] ?? {}), ...contribs };
  }
  return merged;
}

function mergeHistory(
  current: Record<string, DayRecord>,
  incoming: Record<string, DayRecord>,
): Record<string, DayRecord> {
  const merged: Record<string, DayRecord> = { ...current };
  for (const [day, record] of Object.entries(incoming)) {
    const existing = merged[day];
    merged[day] = existing
      ? {
          habitStatus: { ...existing.habitStatus, ...record.habitStatus },
          habitStatusTimes: {
            ...(existing.habitStatusTimes ?? {}),
            ...(record.habitStatusTimes ?? {}),
          },
          valueEntries: mergeValueEntries(existing.valueEntries, record.valueEntries),
        }
      : record;
  }
  return merged;
}

export function mergeAppData(current: AppData, incoming: AppData): AppData {
  return {
    version: Math.max(current.version, incoming.version),
    timeframes: mergeById(current.timeframes, incoming.timeframes),
    categories: mergeById(current.categories, incoming.categories),
    habits: mergeByUpdatedAt(current.habits, incoming.habits),
    values: mergeByUpdatedAt(current.values, incoming.values),
    todos: mergeByUpdatedAt(current.todos, incoming.todos),
    projects: mergeByUpdatedAt(current.projects, incoming.projects),
    fields: mergeByUpdatedAt(current.fields ?? [], incoming.fields ?? []),
    entities: mergeByUpdatedAt(current.entities ?? [], incoming.entities ?? []),
    todoLists: mergeByUpdatedAt(
      current.todoLists ?? [],
      incoming.todoLists ?? [],
    ),
    history: mergeHistory(current.history, incoming.history),
    settings: current.settings,
  };
}
