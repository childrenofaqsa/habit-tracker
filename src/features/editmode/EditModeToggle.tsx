import { Pencil } from "lucide-react";
import { Switch } from "@/common/components/ui/form/switch";
import { Label } from "@/common/components/ui/form/label";
import { useAppStore } from "@/store/useAppStore";

export function EditModeToggle() {
  const editMode = useAppStore((state) => state.settings.editMode);
  const toggleEditMode = useAppStore((state) => state.toggleEditMode);

  return (
    <div className="flex items-center gap-2">
      <Pencil className="size-4 text-muted-foreground" />
      <Label htmlFor="edit-mode" className="hidden text-sm sm:inline">
        Edit
      </Label>
      <Switch id="edit-mode" checked={editMode} onCheckedChange={toggleEditMode} />
    </div>
  );
}
