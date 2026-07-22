import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import type { Project, Priority } from "@/lib/schema";

type DraftTask = {
  tempId: string;
  title: string;
  priority: Priority;
  plan: string;
  goalTarget: number;
  date: string;
};

type EditProjectPageProps = {
  project: Project | null;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </label>
  );
}

const PRIORITY_CYCLE: Priority[] = ["medium", "high", "low"];
const PRIORITY_PILL: Record<Priority, string> = {
  high: "bg-red-500/15 text-red-500",
  medium: "bg-amber-500/15 text-amber-600",
  low: "bg-emerald-500/15 text-emerald-600",
};

export function EditProjectPage({ project }: EditProjectPageProps) {
  const isNew = !project;
  const addProject = useAppStore((s) => s.addProject);
  const updateProject = useAppStore((s) => s.updateProject);
  const addTodo = useAppStore((s) => s.addTodo);
  const setEditingProjectId = useUiStore((s) => s.setEditingProjectId);

  const [name, setName] = useState(project?.name ?? "");
  const [deadlineDate, setDeadlineDate] = useState(project?.deadlineDate ?? "");
  const [deadlineTime, setDeadlineTime] = useState(project?.deadlineTime ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [tasks, setTasks] = useState<DraftTask[]>([]);

  function addDraftTask() {
    setTasks((prev) => [
      ...prev,
      {
        tempId: `t-${Date.now()}-${prev.length}`,
        title: "",
        priority: "medium",
        plan: "",
        goalTarget: 0,
        date: "",
      },
    ]);
  }

  function updateDraft(tempId: string, patch: Partial<DraftTask>) {
    setTasks((prev) => prev.map((t) => (t.tempId === tempId ? { ...t, ...patch } : t)));
  }

  function removeDraft(tempId: string) {
    setTasks((prev) => prev.filter((t) => t.tempId !== tempId));
  }

  function close() {
    setEditingProjectId(null);
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    let projectId = project?.id ?? "";
    if (isNew) {
      projectId = addProject({
        name: trimmed,
        description: description.trim(),
        deadlineDate: deadlineDate || null,
        deadlineTime: deadlineTime || null,
        priority: "medium",
      });
    } else if (project) {
      updateProject(project.id, {
        name: trimmed,
        description: description.trim(),
        deadlineDate: deadlineDate || null,
        deadlineTime: deadlineTime || null,
      });
      projectId = project.id;
    }
    for (const t of tasks) {
      if (!t.title.trim()) continue;
      addTodo({
        title: t.title.trim(),
        priority: t.priority,
        plan: t.plan,
        goalTarget: t.goalTarget,
        date: t.date || null,
        projectId,
      });
    }
    close();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight">
          {isNew ? "Create New Project" : "Edit Project"}
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
            disabled={!name.trim()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            Save Project
          </button>
        </div>
      </header>

      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <FieldLabel>Project Name</FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q4 Marketing Campaign"
            className="mt-2 h-12 w-full rounded-xl bg-muted/60 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Deadline Date</FieldLabel>
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl bg-muted/60 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <FieldLabel>Time</FieldLabel>
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl bg-muted/60 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the project's goal..."
            className="mt-2 w-full resize-none rounded-xl bg-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Project Tasks</h3>
          <button
            type="button"
            onClick={addDraftTask}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <Plus className="size-4" /> Add Task
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="pb-3">Task Label</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Goal</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Tracker</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                    No tasks added. Click “Add Task”.
                  </td>
                </tr>
              )}
              {tasks.map((t) => (
                <tr key={t.tempId} className="border-t border-border align-top">
                  <td className="py-3 pr-3">
                    <input
                      value={t.title}
                      onChange={(e) => updateDraft(t.tempId, { title: e.target.value })}
                      placeholder="Task name"
                      className="block w-full rounded-md bg-transparent px-1 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft(t.tempId, {
                          priority:
                            PRIORITY_CYCLE[
                              (PRIORITY_CYCLE.indexOf(t.priority) + 1) % PRIORITY_CYCLE.length
                            ]!,
                        })
                      }
                      className={cn(
                        "mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide",
                        PRIORITY_PILL[t.priority],
                      )}
                    >
                      {t.priority.toUpperCase()}
                    </button>
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      value={t.plan}
                      onChange={(e) => updateDraft(t.tempId, { plan: e.target.value })}
                      placeholder="Plan"
                      className="block w-full border-b border-dashed border-border bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-primary"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      type="number"
                      min={0}
                      value={t.goalTarget}
                      onChange={(e) =>
                        updateDraft(t.tempId, { goalTarget: Number(e.target.value) })
                      }
                      className="block w-16 rounded-md bg-muted/60 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={t.date}
                        onChange={(e) => updateDraft(t.tempId, { date: e.target.value })}
                        className="block h-9 w-full rounded-md bg-muted/60 px-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                      <CalendarIcon className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      type="button"
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Create Tracker
                    </button>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => removeDraft(t.tempId)}
                      aria-label="Remove task"
                      className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
