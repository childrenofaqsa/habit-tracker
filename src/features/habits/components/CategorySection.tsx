import { Trash2 } from "lucide-react";
import type { Category } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/common/components/ui/data/button";
import { EditableTitle } from "@/features/editmode/EditableTitle";
import { HabitRow } from "@/features/habits/components/HabitRow";

type Props = { category: Category; handle?: React.ReactNode };

export function CategorySection({ category, handle }: Props) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const renameCategory = useAppStore((state) => state.renameCategory);
  const deleteCategory = useAppStore((state) => state.deleteCategory);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          {handle}
          <EditableTitle
            value={category.name}
            editMode={editMode}
            onRename={(name) => renameCategory(category.id, name)}
            className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-foreground"
          />
        </span>
        {editMode && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Delete category"
            onClick={() => deleteCategory(category.id)}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        )}
      </div>
      <HabitRow categoryId={category.id} />
    </div>
  );
}
