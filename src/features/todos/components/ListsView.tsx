import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useShallow } from "zustand/react/shallow";
import { TodoCard } from "@/features/todos/components/TodoCard";
import { cn } from "@/lib/cn";

export function ListsView() {
  const todos = useAppStore(useShallow((s) => s.todos));
  const todoLists = useAppStore(useShallow((s) => s.todoLists));
  const addTodoList = useAppStore((s) => s.addTodoList);
  const deleteTodoList = useAppStore((s) => s.deleteTodoList);

  const activeListId = useUiStore((s) => s.activeTodoListId);
  const setActiveListId = useUiStore((s) => s.setActiveTodoListId);
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);
  const setCreatingTodoListId = useUiStore((s) => s.setCreatingTodoListId);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const visibleTodos = useMemo(() => {
    const filtered = activeListId
      ? todos.filter((t) => t.listId === activeListId)
      : todos.filter((t) => !t.projectId);
    return [...filtered].sort((a, b) => a.order - b.order);
  }, [todos, activeListId]);

  const sortedLists = useMemo(
    () => [...todoLists].sort((a, b) => a.order - b.order),
    [todoLists],
  );

  function handleCreateList() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setAdding(false);
      setNewName("");
      return;
    }
    const id = addTodoList(trimmed);
    setActiveListId(id);
    setAdding(false);
    setNewName("");
  }

  function handleCreateTask() {
    setCreatingTodoListId(activeListId);
    setEditingTodoId("new");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <ListPill
          active={activeListId === null}
          label="All"
          onClick={() => setActiveListId(null)}
        />
        {sortedLists.map((list) => (
          <ListPill
            key={list.id}
            active={activeListId === list.id}
            label={list.name}
            onClick={() => setActiveListId(list.id)}
            onDelete={() => {
              deleteTodoList(list.id);
              if (activeListId === list.id) setActiveListId(null);
            }}
          />
        ))}
        {adding ? (
          <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateList();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
              onBlur={handleCreateList}
              placeholder="List name"
              className="w-32 bg-transparent px-2 text-xs font-bold focus:outline-none"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-bold tracking-wide text-muted-foreground transition-colors hover:bg-muted/70"
          >
            <Plus className="size-3" />
            Add List
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleCreateTask}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" />
        Create Task
      </button>

      <div className="space-y-2">
        {visibleTodos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No tasks in this list.
          </div>
        ) : (
          visibleTodos.map((todo) => <TodoCard key={todo.id} todo={todo} />)
        )}
      </div>
    </div>
  );
}

function ListPill({
  active,
  label,
  onClick,
  onDelete,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground hover:bg-muted/70",
      )}
    >
      <button type="button" onClick={onClick} className="focus:outline-none">
        {label}
      </button>
      {onDelete && active && (
        <button
          type="button"
          aria-label={`Delete ${label}`}
          onClick={onDelete}
          className="-mr-1 ml-1 grid size-4 place-items-center rounded-full hover:bg-black/10"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
