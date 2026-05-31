import { Trash2 } from "lucide-react";
import type { Category } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/common/components/ui/data/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/common/components/ui/data/card";
import { EditableTitle } from "@/features/editmode/EditableTitle";
import { HabitRow } from "@/features/habits/components/HabitRow";

type Props = { category: Category; handle?: React.ReactNode };

export function CategorySection({ category, handle }: Props) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const renameCategory = useAppStore((state) => state.renameCategory);
  const deleteCategory = useAppStore((state) => state.deleteCategory);

  return (
    <Card className="border-border/60 bg-card/50 shadow-none">
      <CardHeader className="px-3 py-2.5">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            {handle}
            <EditableTitle
              value={category.name}
              editMode={editMode}
              onRename={(name) => renameCategory(category.id, name)}
              className="text-sm font-semibold text-foreground"
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
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <HabitRow categoryId={category.id} />
      </CardContent>
    </Card>
  );
}
