import { Trash2, GripVertical, ChevronDown, Sun, SunMedium, Sunset, Moon } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/cn";
import type { Timeframe } from "@/lib/schema";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { selectCategories } from "@/store/selectors";
import { Button } from "@/common/components/ui/data/button";
import { EditableTitle } from "@/features/editmode/EditableTitle";
import { AddInline } from "@/features/editmode/AddInline";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { CategorySection } from "@/features/habits/components/CategorySection";

function getTimeframeIcon(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("morning")) return Sun;
  if (normalized.includes("noon")) return SunMedium;
  if (normalized.includes("evening")) return Sunset;
  if (normalized.includes("night")) return Moon;
  return Sun;
}

type Props = { timeframe: Timeframe; handle?: React.ReactNode };

export function TimeframeSection({ timeframe, handle }: Props) {
  const storedOpen = useUiStore((state) => state.timeframeOpen[timeframe.id]);
  const setTimeframeOpen = useUiStore((state) => state.setTimeframeOpen);
  const open = storedOpen ?? true;
  const editMode = useAppStore((state) => state.settings.editMode);
  const categories = useAppStore(useShallow(selectCategories(timeframe.id)));
  const renameTimeframe = useAppStore((state) => state.renameTimeframe);
  const deleteTimeframe = useAppStore((state) => state.deleteTimeframe);
  const addCategory = useAppStore((state) => state.addCategory);
  const reorderCategories = useAppStore((state) => state.reorderCategories);
  const Icon = getTimeframeIcon(timeframe.name);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(next) => setTimeframeOpen(timeframe.id, next)}
      asChild
    >
      <section className="overflow-hidden rounded-3xl border border-indigo-50 bg-white shadow-sm dark:border-border dark:bg-card">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between px-6 py-5 text-left"
          >
            <div className="flex items-center gap-3">
              {handle}
              <Icon className="size-5 text-black dark:text-foreground" />
              <EditableTitle
                value={timeframe.name}
                editMode={editMode}
                onRename={(name) => renameTimeframe(timeframe.id, name)}
                className="font-bold text-black dark:text-foreground"
              />
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
                  "size-5 text-black/30 transition-transform duration-200 dark:text-muted-foreground",
                  open && "rotate-180",
                )}
              />
            </div>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="space-y-8 px-8 pb-10 pt-2 data-[state=closed]:animate-[accordion-up_0.2s_ease] data-[state=open]:animate-[accordion-down_0.2s_ease]">
          {editMode ? (
            <DndList
              ids={categories.map((category) => category.id)}
              strategy={verticalListSortingStrategy}
              onReorder={(ids) => reorderCategories(timeframe.id, ids)}
            >
              <div className="space-y-8">
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
            <div className="space-y-8">
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
