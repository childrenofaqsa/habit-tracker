import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
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
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  const [searchOpen, setSearchOpen] = useState(searchQuery.length > 0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    setSearchQuery("");
    setSearchOpen(false);
  }

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
      <div className="flex items-center justify-between gap-3 border-b border-border">
        <div className="flex items-center gap-6">
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

        <div className="flex items-center pb-2">
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
                placeholder="Search tasks..."
                className="h-9 w-56 rounded-full border border-border bg-muted/50 pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close search"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Search tasks"
            >
              <Search className="size-4" />
            </button>
          )}
        </div>
      </div>

      {todoTab === "todo" ? <TodoHomeView /> : todoTab === "projects" ? <ProjectsHomeView /> : <ListsView />}
    </div>
  );
}
