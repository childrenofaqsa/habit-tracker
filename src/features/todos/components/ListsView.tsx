import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useShallow } from "zustand/react/shallow";
import { TodoCard } from "@/features/todos/components/TodoCard";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { cn } from "@/lib/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/overlay/dialog";
import { Button } from "@/common/components/ui/data/button";

export function ListsView() {
  const todos = useAppStore(useShallow((s) => s.todos));
  const todoLists = useAppStore(useShallow((s) => s.todoLists));
  const addTodoList = useAppStore((s) => s.addTodoList);
  const deleteTodoList = useAppStore((s) => s.deleteTodoList);
  const reorderTodos = useAppStore((s) => s.reorderTodos);

  const activeListId = useUiStore((s) => s.activeTodoListId);
  const setActiveListId = useUiStore((s) => s.setActiveTodoListId);
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);
  const setCreatingTodoListId = useUiStore((s) => s.setCreatingTodoListId);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null);

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
              setListToDelete({ id: list.id, name: list.name });
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

      {visibleTodos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
          No tasks in this list.
        </div>
      ) : (
        <DndList
          ids={visibleTodos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
          onReorder={reorderTodos}
          mode="longpress"
        >
          <div className="space-y-2">
            {visibleTodos.map((todo) => (
              <Sortable key={todo.id} id={todo.id}>
                {({ attributes, listeners, isDragging }) => (
                  <div
                    {...attributes}
                    {...listeners}
                    className={cn(
                      "touch-none select-none",
                      isDragging && "cursor-grabbing",
                    )}
                  >
                    <TodoCard todo={todo} />
                  </div>
                )}
              </Sortable>
            ))}
          </div>
        </DndList>
      )}

      <Dialog open={!!listToDelete} onOpenChange={(open) => !open && setListToDelete(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription>
              Do you want to delete the list &ldquo;{listToDelete?.name}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setListToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (listToDelete) {
                  deleteTodoList(listToDelete.id);
                  if (activeListId === listToDelete.id) {
                    setActiveListId(null);
                  }
                  setListToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
