type RawData = Record<string, unknown>;

export function migrateV4ToV5(data: RawData): RawData {
  const todos = (data.todos as Array<Record<string, unknown>> | undefined) ?? [];
  const upgradedTodos = todos.map((t) => ({
    projectId: null,
    status: t.completed ? "done" : "todo",
    plan: "",
    goalCurrent: 0,
    goalTarget: 0,
    ...t,
  }));
  return { ...data, todos: upgradedTodos, projects: data.projects ?? [] };
}
