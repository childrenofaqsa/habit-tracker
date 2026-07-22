import { useEffect, useRef, useState } from "react";
import { ChevronRight, Trash2, Tag } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectFields } from "@/store/selectors";
import { EmptyState } from "@/common/components/EmptyState";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/overlay/sheet";

type Props = { createNonce: number };

export function FieldNamesTab({ createNonce }: Props) {
  const fields = useAppStore(useShallow(selectFields));
  const addField = useAppStore((s) => s.addField);
  const renameField = useAppStore((s) => s.renameField);
  const deleteField = useAppStore((s) => s.deleteField);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (createNonce === 0) return;
    setAdding(true);
    setDraft("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [createNonce]);

  function commitAdd() {
    const name = draft.trim();
    if (name) addField(name);
    setAdding(false);
    setDraft("");
  }

  function openEdit(id: string, name: string) {
    setEditId(id);
    setEditName(name);
  }

  function commitEdit() {
    if (editId && editName.trim()) renameField(editId, editName.trim());
    setEditId(null);
  }

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
            placeholder="Field name..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      )}

      {fields.length === 0 && !adding ? (
        <EmptyState
          icon={Tag}
          title="No fields yet"
          description="Create field names like protein, fat, or calcium."
        />
      ) : (
        fields.map((field) => (
          <button
            key={field.id}
            type="button"
            onClick={() => openEdit(field.id, field.name)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left hover:bg-muted/50"
          >
            <span className="text-sm font-medium">{field.name}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))
      )}

      <Sheet open={editId !== null} onOpenChange={(open) => !open && setEditId(null)}>
        <SheetContent side="bottom" className="flex flex-col gap-4 pb-8">
          <SheetHeader>
            <SheetTitle>Edit Field</SheetTitle>
          </SheetHeader>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Field name..."
            className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (editId) deleteField(editId);
                setEditId(null);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-destructive px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" /> Delete
            </button>
            <button
              type="button"
              onClick={commitEdit}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
