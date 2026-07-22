import { newId } from "@/lib/id";
import type { AppSlice, FieldsActions } from "@/store/types";

function applyOrder(items: { id: string; order: number }[], orderedIds: string[]): void {
  const rank = new Map(orderedIds.map((id, index) => [id, index]));
  for (const item of items) {
    const next = rank.get(item.id);
    if (next !== undefined) item.order = next;
  }
}

export const createFieldsSlice: AppSlice<FieldsActions> = (set) => ({
  addField: (name) => {
    const id = newId();
    const now = Date.now();
    set((draft) => {
      const order = draft.fields.reduce((max, f) => Math.max(max, f.order + 1), 0);
      draft.fields.push({ id, name, order, createdAt: now, updatedAt: now });
    });
    return id;
  },

  renameField: (id, name) =>
    set((draft) => {
      const field = draft.fields.find((item) => item.id === id);
      if (!field) return;
      field.name = name;
      field.updatedAt = Date.now();
    }),

  deleteField: (id) =>
    set((draft) => {
      draft.fields = draft.fields.filter((field) => field.id !== id);
      for (const entity of draft.entities) {
        entity.fieldIds = entity.fieldIds.filter((fieldId) => fieldId !== id);
      }
    }),

  reorderFields: (orderedIds) =>
    set((draft) => {
      applyOrder(draft.fields, orderedIds);
    }),
});
