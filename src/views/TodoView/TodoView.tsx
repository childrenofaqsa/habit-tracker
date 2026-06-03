import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useShallow } from "zustand/react/shallow";
import { TodoHomeView } from "@/features/todos/components/TodoHomeView";
import { ProjectsHomeView } from "@/features/todos/components/ProjectsHomeView";
import { ListsView } from "@/features/todos/components/ListsView";
import { EditTodoPage } from "@/features/todos/components/EditTodoPage";
import { EditProjectPage } from "@/features/todos/components/EditProjectPage";

const TABS = [
  { id: "todo", label: "To Do" },
  { id: "projects", label: "Projects" },
  { id: "list", label: "List" },
] as const;

export function TodoView() {
  const todoTab = useUiStore((s) => s.todoTab);
  const setTodoTab = useUiStore((s) => s.setTodoTab);
  const editingTodoId = useUiStore((s) => s.editingTodoId);
  const editingProjectId = useUiStore((s) => s.editingProjectId);

  const todos = useAppStore(useShallow((s) => s.todos));
  const projects = useAppStore(useShallow((s) => s.projects));

  const editingTodo = useMemo(
    () => (editingTodoId && editingTodoId !== "new" ? todos.find((t) => t.id === editingTodoId) ?? null : null),
    [todos, editingTodoId],
  );
  const editingProject = useMemo(
    () =>
      editingProjectId && editingProjectId !== "new"
        ? projects.find((p) => p.id === editingProjectId) ?? null
        : null,
    [projects, editingProjectId],
  );

  if (editingProjectId !== null) {
    return <EditProjectPage project={editingProject} />;
  }
  if (editingTodoId !== null) {
    return <EditTodoPage todo={editingTodo} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 border-b border-border">
        {TABS.map((tab) => {
          const active = todoTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTodoTab(tab.id)}
              className={cn(
                "relative -mb-px py-3 text-sm font-bold tracking-tight transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {todoTab === "todo" ? <TodoHomeView /> : todoTab === "projects" ? <ProjectsHomeView /> : <ListsView />}
    </div>
  );
}
