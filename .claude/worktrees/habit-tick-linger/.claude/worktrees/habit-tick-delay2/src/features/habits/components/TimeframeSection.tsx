import { useMemo, useState } from "react";
import { Trash2, GripVertical, ChevronDown, Sun, SunMedium, Sunset, Moon, Plus } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import type { Timeframe } from "@/lib/schema";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { selectCategories, isHabitVisibleOnMyDay } from "@/store/selectors";
import { useSelectedDate } from "@/common/hooks/useSelectedDate";
import { Button } from "@/common/components/ui/data/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/overlay/popover";
import { Input } from "@/common/components/ui/form/input";
import { EditableTitle } from "@/features/editmode/EditableTitle";
import { DndList } from "@/features/editmode/DndList";
import { Sortable } from "@/features/editmode/Sortable";
import { CategorySection } from "@/features/habits/components/CategorySection";
import { usePickMode } from "@/features/habits/pickMode";

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
  const allStoredCategories = useAppStore(useShallow(selectCategories(timeframe.id)));
  const allCategories = useAppStore((state) => state.categories);
  const habits = useAppStore((state) => state.habits);
  const renameTimeframe = useAppStore((state) => state.renameTimeframe);
  const deleteTimeframe = useAppStore((state) => state.deleteTimeframe);
  const addCategory = useAppStore((state) => state.addCategory);
  const reorderCategories = useAppStore((state) => state.reorderCategories);
  const Icon = getTimeframeIcon(timeframe.name);

  // "Show empty category" only takes effect on the main My Day screen — Edit
  // Mode and the Pick screen always show every category (same scope as the
  // "show empty timeframes" filter).
  const pickMode = usePickMode();
  const selectedDate = useSelectedDate();
  const showEmptyCategories = useUiStore((state) => state.dailyShowEmptyCategories);
  const showCompleted = useUiStore((state) => state.dailyShowCompleted);
  const showDiscarded = useUiStore((state) => state.dailyShowDiscarded);
  const priorityFilter = useUiStore(useShallow((state) => state.dailyPriorityFilter));
  const recentlyToggled = useUiStore(useShallow((state) => state.myDayRecentlyToggled));
  const dayStatus = useAppStore((state) => state.history[selectedDate]?.habitStatus);

  const categories = useMemo(() => {
    if (editMode || pickMode || showEmptyCategories) return allStoredCategories;
    return allStoredCategories.filter((category) =>
      habits.some(
        (h) =>
          h.categoryId === category.id &&
          isHabitVisibleOnMyDay(h, dayStatus?.[h.id], {
            showCompleted,
            showDiscarded,
            priorities: priorityFilter,
            recentlyToggled: recentlyToggled.includes(h.id),
          }),
      ),
    );
  }, [
    editMode,
    pickMode,
    showEmptyCategories,
    allStoredCategories,
    habits,
    showCompleted,
    showDiscarded,
    priorityFilter,
    recentlyToggled,
    dayStatus,
  ]);

  const localNames = new Set(
    categories.map((c) => c.name.trim().toLowerCase()),
  );
  const pickableNames = Array.from(
    new Set(
      allCategories
        .filter((c) => c.timeframeId !== timeframe.id)
        .map((c) => c.name)
        .filter((name) => !localNames.has(name.trim().toLowerCase())),
    ),
  ).sort((a, b) => a.localeCompare(b));

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
            <AddCategoryPopover
              timeframeId={timeframe.id}
              pickableNames={pickableNames}
              localNames={localNames}
              addCategory={addCategory}
            />
          )}
        </Collapsible.Content>
      </section>
    </Collapsible.Root>
  );
}

type AddCategoryPopoverProps = {
  timeframeId: string;
  pickableNames: string[];
  localNames: Set<string>;
  addCategory: (timeframeId: string, name: string) => string;
};

function AddCategoryPopover({
  timeframeId,
  pickableNames,
  localNames,
  addCategory,
}: AddCategoryPopoverProps) {
  const allCategories = useAppStore((state) => state.categories);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");

  function reset() {
    setCreating(false);
    setDraft("");
  }

  function handleSelect(name: string) {
    addCategory(timeframeId, name);
    setOpen(false);
    reset();
  }

  function handleCreate() {
    const trimmed = draft.trim();
    if (!trimmed) {
      reset();
      return;
    }
    const lower = trimmed.toLowerCase();
    if (localNames.has(lower)) {
      toast.error("Category already exists in this timeframe");
      return;
    }
    const existsElsewhere = allCategories.some(
      (c) => c.name.trim().toLowerCase() === lower,
    );
    if (existsElsewhere) {
      toast.error("Category name already exists — pick it from the list instead");
      return;
    }
    addCategory(timeframeId, trimmed);
    setOpen(false);
    reset();
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="inline-flex items-center gap-2">
          <Plus className="size-4" />
          Add Category
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="max-h-56 space-y-0.5 overflow-y-auto">
          {pickableNames.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              No other categories
            </p>
          ) : (
            pickableNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                {name}
              </button>
            ))
          )}
        </div>
        <div className="mt-2 border-t border-border pt-2">
          {creating ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleCreate();
              }}
              className="flex items-center gap-1"
            >
              <Input
                autoFocus
                value={draft}
                placeholder="New category"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") reset();
                }}
                className="h-8 flex-1 text-sm"
              />
              <Button type="submit" size="sm" className="h-8">
                Add
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-primary/10"
            >
              <Plus className="size-4" />
              Create New
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
