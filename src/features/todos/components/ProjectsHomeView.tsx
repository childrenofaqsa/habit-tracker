import { useState } from "react";
import { Plus } from "lucide-react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useShallow } from "zustand/react/shallow";
import { DateScrollRow } from "@/common/components/DateScrollRow";
import { ProjectCard } from "@/features/todos/components/ProjectCard";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { cn } from "@/lib/cn";
import { todayKey } from "@/lib/date";

export function ProjectsHomeView() {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const projects = useAppStore(useShallow((s) => s.projects));
  const todos = useAppStore(useShallow((s) => s.todos));
  const reorderProjects = useAppStore((s) => s.reorderProjects);
  const expandedProjectId = useUiStore((s) => s.expandedProjectId);
  const setExpandedProjectId = useUiStore((s) => s.setExpandedProjectId);
  const setEditingProjectId = useUiStore((s) => s.setEditingProjectId);

  const sorted = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setEditingProjectId("new")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> Add Project
        </button>
      </div>

      <DateScrollRow selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No projects yet. Tap “Add Project” to create one.
          </div>
        )}
        {sorted.length > 0 && (
          <DndList
            ids={sorted.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
            onReorder={reorderProjects}
            mode="longpress"
          >
            <div className="space-y-3">
              {sorted.map((project) => {
                const tasks = todos
                  .filter((t) => t.projectId === project.id)
                  .sort((a, b) => a.order - b.order);
                return (
                  <Sortable key={project.id} id={project.id}>
                    {({ attributes, listeners, isDragging }) => (
                      <div
                        {...attributes}
                        {...listeners}
                        className={cn(
                          "touch-none select-none",
                          isDragging && "cursor-grabbing",
                        )}
                      >
                        <ProjectCard
                          project={project}
                          tasks={tasks}
                          expanded={expandedProjectId === project.id}
                          onToggle={() =>
                            setExpandedProjectId(
                              expandedProjectId === project.id ? null : project.id,
                            )
                          }
                        />
                      </div>
                    )}
                  </Sortable>
                );
              })}
            </div>
          </DndList>
        )}
      </div>
    </div>
  );
}
