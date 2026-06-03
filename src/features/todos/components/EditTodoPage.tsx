import { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import type { Todo, Priority } from "@/lib/schema";

type EditTodoPageProps = {
  todo: Todo | null;
};

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "LOW" },
  { value: "medium", label: "MEDIUM" },
  { value: "high", label: "HIGH" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </label>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 h-12 w-full rounded-xl bg-muted/60 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
    />
  );
}

export function EditTodoPage({ todo }: EditTodoPageProps) {
  const isNew = !todo;
  const addTodo = useAppStore((s) => s.addTodo);
  const updateTodo = useAppStore((s) => s.updateTodo);
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);
  const creatingTodoListId = useUiStore((s) => s.creatingTodoListId);
  const setCreatingTodoListId = useUiStore((s) => s.setCreatingTodoListId);

  const [title, setTitle] = useState(todo?.title ?? "");
  const [time, setTime] = useState<string>(todo?.time ?? "");
  const [priority, setPriority] = useState<Priority | null>(todo?.priority ?? "medium");
  const [tag, setTag] = useState<string>(todo?.tag ?? "");
  const [notes, setNotes] = useState(todo?.notes ?? "");

  function close() {
    setCreatingTodoListId(null);
    setEditingTodoId(null);
  }

  function save() {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (isNew) {
      addTodo({
        title: trimmed,
        notes: notes.trim(),
        time: time || null,
        tag: tag.trim(),
        priority,
        listId: creatingTodoListId ?? null,
      });
    } else if (todo) {
      updateTodo(todo.id, {
        title: trimmed,
        notes: notes.trim(),
        time: time || null,
        tag: tag.trim(),
        priority,
      });
    }
    close();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight">
          {isNew ? "Create Task" : "Edit Task"}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-xl bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!title.trim()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            Save Task
          </button>
        </div>
      </header>

      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <FieldLabel>Habit Name</FieldLabel>
          <TextField value={title} onChange={setTitle} placeholder="Task title" autoFocus={isNew} />
        </div>

        <div>
          <FieldLabel>Time</FieldLabel>
          <div className="relative mt-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-12 w-full rounded-xl bg-muted/60 px-4 pr-12 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Clock className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div>
          <FieldLabel>Priority</FieldLabel>
          <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "rounded-lg py-2.5 text-xs font-bold tracking-wide transition-colors",
                  priority === p.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Tag</FieldLabel>
          <TextField value={tag} onChange={setTag} placeholder="e.g. Work, Health, Personal" />
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Add detailed notes about this task..."
            className="mt-2 w-full resize-none rounded-xl bg-muted/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
    </div>
  );
}
