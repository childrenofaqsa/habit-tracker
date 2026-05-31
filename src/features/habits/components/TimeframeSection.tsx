import { useState } from "react";
import { Trash2, GripVertical, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/cn";
import type { Timeframe } from "@/lib/schema";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectCategories } from "@/store/selectors";
import { Button } from "@/common/components/ui/data/button";
import { Parallax } from "@/common/components/motion/Parallax";
import { EditableTitle } from "@/features/editmode/EditableTitle";
import { AddInline } from "@/features/editmode/AddInline";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { CategorySection } from "@/features/habits/components/CategorySection";

function isCurrentTimeframe(name: string): boolean {
  const hour = new Date().getHours();
  const normalized = name.toLowerCase();
  if (normalized.includes("morning")) return hour >= 5 && hour < 12;
  if (normalized.includes("evening")) return hour >= 12 && hour < 21;
  if (normalized.includes("night")) return hour >= 21 || hour < 5;
  return false;
}

type Props = { timeframe: Timeframe; handle?: React.ReactNode };

export function TimeframeSection({ timeframe, handle }: Props) {
  const [open, setOpen] = useState(true);
  const editMode = useAppStore((state) => state.settings.editMode);
  const categories = useAppStore(useShallow(selectCategories(timeframe.id)));
  const renameTimeframe = useAppStore((state) => state.renameTimeframe);
  const deleteTimeframe = useAppStore((state) => state.deleteTimeframe);
  const addCategory = useAppStore((state) => state.addCategory);
  const reorderCategories = useAppStore((state) => state.reorderCategories);
  const current = isCurrentTimeframe(timeframe.name);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              {handle}
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  current ? "animate-breathe bg-primary" : "bg-border",
                )}
              />
              <Parallax speed={0.06}>
                <EditableTitle
                  value={timeframe.name}
                  editMode={editMode}
                  onRename={(name) => renameTimeframe(timeframe.id, name)}
                  className="text-xl font-bold tracking-tight"
                />
              </Parallax>
            </div>
            <div className="flex items-center gap-1">
              {editMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Delete timeframe"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteTimeframe(timeframe.id);
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
              <ChevronDown
                className={cn(
                  "size-5 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </div>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="px-4 pb-4 data-[state=closed]:animate-[accordion-up_0.2s_ease] data-[state=open]:animate-[accordion-down_0.2s_ease]">
          {editMode ? (
            <DndList
              ids={categories.map((category) => category.id)}
              strategy={verticalListSortingStrategy}
              onReorder={(ids) => reorderCategories(timeframe.id, ids)}
            >
              <div className="space-y-4">
                {categories.map((category) => (
                  <Sortable key={category.id} id={category.id}>
                    {({ attributes, listeners }) => (
                      <CategorySection
                        category={category}
                        handle={
                          <button
                            type="button"
                            aria-label="Drag to reorder"
                            className="grid size-6 cursor-grab touch-none place-items-center rounded-md text-muted-foreground active:cursor-grabbing"
                            {...attributes}
                            {...listeners}
                          >
                            <GripVertical className="size-4" />
                          </button>
                        }
                      />
                    )}
                  </Sortable>
                ))}
              </div>
            </DndList>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <CategorySection key={category.id} category={category} />
              ))}
            </div>
          )}

          {editMode && (
            <AddInline
              label="Add Category"
              placeholder="Category name"
              size="sm"
              variant="secondary"
              onAdd={(name) => addCategory(timeframe.id, name)}
            />
          )}
        </Collapsible.Content>
      </section>
    </Collapsible.Root>
  );
}
