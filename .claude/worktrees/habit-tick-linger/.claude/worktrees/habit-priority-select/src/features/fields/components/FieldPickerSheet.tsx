import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectFields } from "@/store/selectors";
import { cn } from "@/lib/cn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/common/components/ui/overlay/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onToggle: (fieldId: string) => void;
};

export function FieldPickerSheet({ open, onOpenChange, selectedIds, onToggle }: Props) {
  const fields = useAppStore(useShallow(selectFields));
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter((f) => f.name.toLowerCase().includes(q));
  }, [fields, query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex max-h-[80vh] flex-col gap-4 pb-8">
        <SheetHeader>
          <SheetTitle>Add Field</SheetTitle>
          <SheetDescription>Assign existing fields to this entity.</SheetDescription>
        </SheetHeader>
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fields..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No fields available.</p>
          ) : (
            filtered.map((field) => {
              const isSelected = selectedIds.includes(field.id);
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => onToggle(field.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "bg-muted/40 hover:bg-muted",
                  )}
                >
                  <span className="text-sm font-medium">{field.name}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
