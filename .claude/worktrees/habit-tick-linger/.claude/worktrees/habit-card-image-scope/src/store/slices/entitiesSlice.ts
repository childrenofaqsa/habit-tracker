import { newId } from "@/lib/id";
import type { AppSlice, EntitiesActions } from "@/store/types";

function applyOrder(items: { id: string; order: number }[], orderedIds: string[]): void {
  const rank = new Map(orderedIds.map((id, index) => [id, index]));
  for (const item of items) {
    const next = rank.get(item.id);
    if (next !== undefined) item.order = next;
  }
}

export const createEntitiesSlice: AppSlice<EntitiesActions> = (set) => ({
  addEntity: (name) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      const order = draft.entities.reduce((max, e) => Math.max(max, e.order + 1), 0);
      draft.entities.push({ id, name, fieldIds: [], order, createdAt: now, updatedAt: now });
    });
    return id;
  },

  updateEntity: (id, patch) =>
    set((draft) => {
      const entity = draft.entities.find((item) => item.id === id);
      if (!entity) return;
      Object.assign(entity, patch);
      entity.updatedAt = Date.now();
    }),

  toggleEntityField: (entityId, fieldId) =>
    set((draft) => {
      const entity = draft.entities.find((item) => item.id === entityId);
      if (!entity) return;
      if (entity.fieldIds.includes(fieldId)) {
        entity.fieldIds = entity.fieldIds.filter((value) => value !== fieldId);
      } else {
        entity.fieldIds.push(fieldId);
      }
      entity.updatedAt = Date.now();
    }),

  deleteEntity: (id) =>
    set((draft) => {
      draft.entities = draft.entities.filter((entity) => entity.id !== id);
    }),

  reorderEntities: (orderedIds) =>
    set((draft) => {
      applyOrder(draft.entities, orderedIds);
    }),
});
