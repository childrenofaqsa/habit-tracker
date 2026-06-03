import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import type { Todo, Priority } from "@/lib/schema";

type EditTodoPageProps = {
  todo: Todo | null;
};

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "low", label: "Low", color: "bg-blue-500" },
];

export function EditTodoPage({ todo }: EditTodoPageProps) {
  const isNew = !todo;
  const addTodo = useAppStore((s) => s.addTodo);
  const updateTodo = useAppStore((s) => s.updateTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);

  const [title, setTitle] = useState(todo?.title ?? "");
  const [notes, setNotes] = useState(todo?.notes ?? "");
  const [date, setDate] = useState<string>(todo?.date ?? "");
  const [time, setTime] = useState<string>(todo?.time ?? "");
  const [location, setLocation] = useState<string>(todo?.location ?? "");
  const [tag, setTag] = useState<string>(todo?.tag ?? "");
  const [priority, setPriority] = useState<Priority | null>(todo?.priority ?? null);

  function close() {
    setEditingTodoId(null);
  }

  function save() {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (isNew) {
      addTodo({
        title: trimmed,
        notes: notes.trim(),
        date: date || null,
        time: time || null,
        location: location.trim() || null,
        tag: tag.trim(),
        priority,
      });
    } else if (todo) {
      updateTodo(todo.id, {
        title: trimmed,
        notes: notes.trim(),
        date: date || null,
        time: time || null,
        location: location.trim() || null,
        tag: tag.trim(),
        priority,
      });
    }
    close();
  }

  function handleDelete() {
    if (todo) deleteTodo(todo.id);
    close();
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={close}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h2 className="text-lg font-semibold">{isNew ? "New Task" : "Edit Task"}</h2>
        {!isNew ? (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete task"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        ) : (
          <span className="w-8" />
        )}
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Task
        </label>
        <input
          type="text"
          autoFocus={isNew}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="mt-1 w-full rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add details"
          rows={3}
          className="mt-1 w-full resize-none rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tag
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Work, Errands"
            className="mt-1 w-full rounded-lg border-0 bg-muted/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Priority</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPriority(null)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              priority === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            None
          </button>
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                priority === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={cn("size-2 rounded-full", opt.color)} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={close}
          className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!title.trim()}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {isNew ? "Add Task" : "Save"}
        </button>
      </div>
    </div>
  );
}
