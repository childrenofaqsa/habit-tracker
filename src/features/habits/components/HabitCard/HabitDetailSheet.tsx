import { useRef } from "react";
import { ImageUp, Trash2, Link2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/common/components/ui/overlay/sheet";
import { Input } from "@/common/components/ui/form/input";
import { Textarea } from "@/common/components/ui/form/textarea";
import { Label } from "@/common/components/ui/form/label";
import { Button } from "@/common/components/ui/data/button";
import { Separator } from "@/common/components/ui/data/separator";
import type { Habit } from "@/lib/schema";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectValues } from "@/store/selectors";
import { useHabitActions } from "@/features/habits/hooks/useHabitActions";
import { deleteImage, revokeImageUrl } from "@/storage/imageStore";

type Props = {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HabitDetailSheet({ habit, open, onOpenChange }: Props) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const values = useAppStore(useShallow(selectValues));
  const updateHabit = useAppStore((state) => state.updateHabit);
  const linkHabitToValue = useAppStore((state) => state.linkHabitToValue);
  const deleteHabit = useAppStore((state) => state.deleteHabit);
  const { uploadImage } = useHabitActions();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    if (habit.imageId) {
      revokeImageUrl(habit.imageId);
      void deleteImage(habit.imageId);
    }
    deleteHabit(habit.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="space-y-4">
        <SheetHeader>
          <SheetTitle>Habit details</SheetTitle>
          <SheetDescription>View and adjust this habit.</SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <Label htmlFor="habit-title">Title</Label>
          <Input
            id="habit-title"
            value={habit.title}
            readOnly={!editMode}
            onChange={(event) => updateHabit(habit.id, { title: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="habit-details">Details</Label>
          <Textarea
            id="habit-details"
            value={habit.details}
            placeholder="Add a note or description"
            onChange={(event) => updateHabit(habit.id, { details: event.target.value })}
          />
        </div>

        {editMode && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Linked value</Label>
              <select
                value={habit.linkedValueId ?? ""}
                onChange={(event) =>
                  linkHabitToValue(habit.id, event.target.value || null)
                }
                className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {values.map((value) => (
                  <option key={value.id} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </select>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Link2 className="size-3" /> Completing this habit prompts the value.
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(habit, file);
                event.target.value = "";
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileRef.current?.click()}
              >
                <ImageUp className="size-4" /> Replace image
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
