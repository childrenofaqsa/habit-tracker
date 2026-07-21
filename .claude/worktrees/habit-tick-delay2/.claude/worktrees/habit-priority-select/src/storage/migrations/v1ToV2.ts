type RawData = Record<string, unknown>;

type RawHabit = {
  priority?: string;
  motivation?: string;
  scheduledTime?: string | null;
  recurrence?: string[];
  notifications?: boolean;
};

type RawTodo = {
  priority?: string;
  time?: string | null;
  location?: string | null;
};

type RawValue = {
  unit?: string;
  goalType?: string | null;
  goalTarget?: number | null;
};

export function migrateV1ToV2(data: RawData): RawData {
  const habits = (data.habits as RawHabit[] | undefined) ?? [];
  const todos = (data.todos as RawTodo[] | undefined) ?? [];
  const values = (data.values as RawValue[] | undefined) ?? [];

  return {
    ...data,
    habits: habits.map((h) => ({
      ...h,
      priority: h.priority ?? "medium",
      motivation: h.motivation ?? "",
      scheduledTime: h.scheduledTime ?? null,
      recurrence: h.recurrence ?? ["everyday"],
      notifications: h.notifications ?? false,
    })),
    todos: todos.map((t) => ({
      ...t,
      priority: t.priority ?? "medium",
      time: t.time ?? null,
      location: t.location ?? null,
    })),
    values: values.map((v) => ({
      ...v,
      unit: v.unit ?? "",
      goalType: v.goalType ?? null,
      goalTarget: v.goalTarget ?? null,
    })),
  };
}
