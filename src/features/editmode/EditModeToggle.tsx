import { Pencil, PencilOff } from "lucide-react";
import { Button } from "@/common/components/ui/data/button";
import { useAppStore } from "@/store/useAppStore";

export function EditModeToggle() {
  const editMode = useAppStore((state) => state.settings.editMode);
  const toggleEditMode = useAppStore((state) => state.toggleEditMode);

  return (
    <Button
      variant={editMode ? "default" : "ghost"}
      size="icon"
      aria-label={editMode ? "Exit edit mode" : "Enter edit mode"}
      aria-pressed={editMode}
      onClick={toggleEditMode}
      className="size-9"
    >
      {editMode ? (
        <PencilOff className="size-4" />
      ) : (
        <Pencil className="size-4" />
      )}
    </Button>
  );
}
