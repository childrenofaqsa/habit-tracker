import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/cn";
import type { Project, Todo, Priority } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { formatHumanDate } from "@/lib/date";

type ProjectCardProps = {
  project: Project;
  tasks: Todo[];
  expanded: boolean;
  onToggle: () => void;
};

const PRIORITY_BADGE: Record<Priority, { label: string; cls: string }> = {
  high: { label: "HIGH", cls: "bg-red-500/10 text-red-500" },
  medium: { label: "MEDIUM", cls: "bg-amber-500/10 text-amber-500" },
  low: { label: "LOW", cls: "bg-emerald-500/10 text-emerald-500" },
};

function statusBadge(t: Todo) {
  if (t.completed || t.status === "done") return { label: "DONE", cls: "bg-emerald-500/15 text-emerald-600" };
  if (t.status === "blocked") return { label: "BLOCKED", cls: "bg-red-500/15 text-red-600" };
  if (t.status === "in_progress") return { label: "IN PROGRESS", cls: "bg-blue-500/15 text-blue-600" };
  return { label: "TO DO", cls: "bg-muted text-muted-foreground" };
}

export function ProjectCard({ project, tasks, expanded, onToggle }: ProjectCardProps) {
  const setEditingProjectId = useUiStore((s) => s.setEditingProjectId);
  const setEditingTodoId = useUiStore((s) => s.setEditingTodoId);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const reorderTodos = useAppStore((s) => s.reorderTodos);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed || t.status === "done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = pct === 100;

  const breadcrumbText = ["PROJECTS", ...(project.breadcrumb ?? []), project.name.toUpperCase()].join(" / ");

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-sm transition-colors",
        expanded ? "border-primary/40 ring-1 ring-primary/30" : "border-border",
      )}
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold tracking-tight">{project.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {done}/{total} tasks completed
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                complete ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Collapse" : "Expand"}
          className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </button>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Project menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="size-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setEditingProjectId(project.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <Pencil className="size-4" /> Edit
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); deleteProject(project.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-border pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {breadcrumbText}
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Overall Completion
                  </p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight">
                    {done} of {total} tasks completed
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          complete ? "bg-emerald-500" : "bg-primary",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{pct}%</span>
                  </div>
                </div>
                <div className="flex gap-6 sm:flex-col">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      End Date
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {project.deadlineDate ? formatHumanDate(project.deadlineDate) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Priority
                    </p>
                    {project.priority ? (
                      <span
                        className={cn(
                          "mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide",
                          PRIORITY_BADGE[project.priority].cls,
                        )}
                      >
                        {PRIORITY_BADGE[project.priority].label}
                      </span>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-bold">Active Tasks</p>
                <div className="space-y-2">
                  {tasks.length === 0 && (
                    <p className="text-xs text-muted-foreground">No tasks yet.</p>
                  )}
                  {tasks.length > 0 && (
                    <DndList
                      ids={tasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                      onReorder={reorderTodos}
                      mode="longpress"
                    >
                      <div className="space-y-2">
                        {tasks.map((t) => (
                          <Sortable key={t.id} id={t.id}>
                            {({ attributes, listeners, isDragging }) => (
                              <div
                                {...attributes}
                                {...listeners}
                                className={cn(
                                  "touch-none select-none",
                                  isDragging && "cursor-grabbing",
                                )}
                              >
                                <ProjectTaskRow
                                  task={t}
                                  onEdit={() => setEditingTodoId(t.id)}
                                />
                              </div>
                            )}
                          </Sortable>
                        ))}
                      </div>
                    </DndList>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingTodoId("new")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Plus className="size-4" /> Add New Task
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectTaskRow({ task: t, onEdit }: { task: Todo; onEdit: () => void }) {
  const badge = statusBadge(t);
  const goalPct =
    t.goalTarget > 0 ? Math.min(100, Math.round((t.goalCurrent / t.goalTarget) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {t.completed ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{t.title}</p>
        {t.plan && <p className="truncate text-[11px] text-muted-foreground">{t.plan}</p>}
        {t.goalTarget > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground">
              Goal: {t.goalCurrent}/{t.goalTarget}
            </span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${goalPct}%` }} />
            </div>
            <span className="text-[10px] font-bold">{goalPct}%</span>
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label="Edit task"
        onClick={onEdit}
        onPointerDown={(e) => e.stopPropagation()}
        className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil className="size-4" />
      </button>
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide",
          badge.cls,
        )}
      >
        {badge.label}
      </span>
    </div>
  );
}
