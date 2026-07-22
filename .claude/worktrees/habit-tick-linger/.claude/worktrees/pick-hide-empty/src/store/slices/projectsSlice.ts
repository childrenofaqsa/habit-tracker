import { newId } from "@/lib/id";
import type { AppSlice, ProjectsActions } from "@/store/types";

export const createProjectsSlice: AppSlice<ProjectsActions> = (set) => ({
  addProject: (input) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      const maxOrder = draft.projects.reduce(
        (max, p) => (p.order > max ? p.order : max),
        -1,
      );
      draft.projects.push({
        id,
        name: input.name,
        description: input.description ?? "",
        deadlineDate: input.deadlineDate ?? null,
        deadlineTime: input.deadlineTime ?? null,
        priority: input.priority ?? null,
        breadcrumb: input.breadcrumb ?? [],
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      });
    });
    return id;
  },

  updateProject: (id, patch) =>
    set((draft) => {
      const project = draft.projects.find((p) => p.id === id);
      if (!project) return;
      Object.assign(project, patch);
      project.updatedAt = Date.now();
    }),

  deleteProject: (id) =>
    set((draft) => {
      draft.projects = draft.projects.filter((p) => p.id !== id);
      for (const todo of draft.todos) {
        if (todo.projectId === id) todo.projectId = null;
      }
    }),

  reorderProjects: (orderedIds) =>
    set((draft) => {
      const indexById = new Map(orderedIds.map((id, idx) => [id, idx]));
      for (const project of draft.projects) {
        const idx = indexById.get(project.id);
        if (idx !== undefined) project.order = idx;
      }
    }),
});
