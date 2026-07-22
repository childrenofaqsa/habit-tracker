type RawData = Record<string, unknown>;

type RawTodo = {
  createdAt?: number;
  tag?: string;
  order?: number;
};

export function migrateV2ToV3(data: RawData): RawData {
  const todos = (data.todos as RawTodo[] | undefined) ?? [];
  const sorted = [...todos].sort(
    (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0),
  );
  const orderByRef = new Map<RawTodo, number>();
  sorted.forEach((todo, idx) => orderByRef.set(todo, idx));

  return {
    ...data,
    todos: todos.map((t) => ({
      ...t,
      tag: t.tag ?? "",
      order: t.order ?? orderByRef.get(t) ?? 0,
    })),
  };
}
