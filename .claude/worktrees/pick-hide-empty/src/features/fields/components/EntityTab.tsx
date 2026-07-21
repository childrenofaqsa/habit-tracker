import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Boxes } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectFields, selectEntities } from "@/store/selectors";
import { Badge } from "@/common/components/ui/data/badge";
import { EmptyState } from "@/common/components/EmptyState";
import { FieldPickerSheet } from "./FieldPickerSheet";

type Props = { createNonce: number };

export function EntityTab({ createNonce }: Props) {
  const entities = useAppStore(useShallow(selectEntities));
  const fields = useAppStore(useShallow(selectFields));
  const addEntity = useAppStore((s) => s.addEntity);
  const deleteEntity = useAppStore((s) => s.deleteEntity);
  const toggleEntityField = useAppStore((s) => s.toggleEntityField);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [pickerEntityId, setPickerEntityId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fieldNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const field of fields) map[field.id] = field.name;
    return map;
  }, [fields]);

  useEffect(() => {
    if (createNonce === 0) return;
    setAdding(true);
    setDraft("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [createNonce]);

  function commitAdd() {
    const name = draft.trim();
    if (name) addEntity(name);
    setAdding(false);
    setDraft("");
  }

  const pickerEntity = entities.find((e) => e.id === pickerEntityId) ?? null;

  return (
    <div className="space-y-3">
      {adding && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAdd();
              if (e.key === "Escape") setAdding(false);
            }}
            onBlur={commitAdd}
            placeholder="Entity name..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      )}

      {entities.length === 0 && !adding ? (
        <EmptyState
          icon={Boxes}
          title="No entities yet"
          description="Create entities like fish or milk and assign fields to them."
        />
      ) : (
        entities.map((entity) => (
          <div
            key={entity.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="shrink-0 text-sm font-bold">{entity.name}</span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {entity.fieldIds.map((fieldId) =>
                fieldNames[fieldId] ? (
                  <Badge key={fieldId} variant="secondary" className="uppercase">
                    {fieldNames[fieldId]}
                  </Badge>
                ) : null,
              )}
            </div>
            <button
              type="button"
              onClick={() => setPickerEntityId(entity.id)}
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:opacity-70"
            >
              <Plus className="size-4" /> Add field
            </button>
            <button
              type="button"
              onClick={() => deleteEntity(entity.id)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="Delete entity"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))
      )}

      <FieldPickerSheet
        open={pickerEntity !== null}
        onOpenChange={(open) => !open && setPickerEntityId(null)}
        selectedIds={pickerEntity?.fieldIds ?? []}
        onToggle={(fieldId) => {
          if (pickerEntityId) toggleEntityField(pickerEntityId, fieldId);
        }}
      />
    </div>
  );
}
