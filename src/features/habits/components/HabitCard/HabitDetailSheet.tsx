import { useRef } from "react";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/common/components/ui/overlay/sheet";
import { Input } from "@/common/components/ui/form/input";
import { Textarea } from "@/common/components/ui/form/textarea";
import { Label } from "@/common/components/ui/form/label";
import { Button } from "@/common/components/ui/data/button";
import type { Habit } from "@/lib/schema";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { selectValues, selectTimeframes } from "@/store/selectors";
import { useHabitActions } from "@/features/habits/hooks/useHabitActions";
import { useHabitImage } from "@/features/habits/hooks/useHabitImage";
import { deleteImage, revokeImageUrl } from "@/storage/imageStore";

type Props = {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HabitDetailSheet({ habit, open, onOpenChange }: Props) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const values = useAppStore(useShallow(selectValues));
  const timeframes = useAppStore(useShallow(selectTimeframes));
  const categories = useAppStore((state) => state.categories);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const linkHabitToValue = useAppStore((state) => state.linkHabitToValue);
  const deleteHabit = useAppStore((state) => state.deleteHabit);
  const { uploadImage } = useHabitActions();
  const imageUrl = useHabitImage(habit.imageId);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentCategory = categories.find((c) => c.id === habit.categoryId);
  const currentTimeframe = timeframes.find((t) =>
    categories.some((c) => c.timeframeId === t.id && c.id === habit.categoryId),
  );

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
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-lg">
        <div className="flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-6 py-4 dark:bg-card">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-muted"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-lg font-bold">Edit Habit</h2>
          </div>

          <div className="space-y-6 p-6">
            {/* Habit Name Section */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-border dark:bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="habit-title" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Habit Name
                  </Label>
                  <Input
                    id="habit-title"
                    value={habit.title}
                    readOnly={!editMode}
                    onChange={(event) => updateHabit(habit.id, { title: event.target.value })}
                    className="text-base font-semibold"
                  />
                </div>
                {editMode && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="shrink-0"
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                )}
              </div>
              <div className="mt-3 space-y-2">
                <Label htmlFor="habit-details" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Details
                </Label>
                <Textarea
                  id="habit-details"
                  value={habit.details}
                  placeholder="Add a note or description"
                  onChange={(event) => updateHabit(habit.id, { details: event.target.value })}
                />
              </div>
            </section>

            {/* Habit Image Section */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-border dark:bg-card">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Habit Image
              </Label>
              <div className="mt-3">
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#633DF7] shadow-sm"
                      >
                        Change Image
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editMode && fileRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-gray-400 transition-colors hover:border-[#633DF7] hover:text-[#633DF7] dark:border-border"
                  >
                    <Upload className="size-8" />
                    <span className="text-sm font-medium">Upload visual cue</span>
                  </button>
                )}
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
            </section>

            {/* Timeframe Section */}
            {editMode && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-border dark:bg-card">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Ideal Timeframe
                </Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {timeframes.map((tf) => (
                    <span
                      key={tf.id}
                      className={
                        currentTimeframe?.id === tf.id
                          ? "rounded-xl bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                          : "rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-border dark:text-foreground"
                      }
                    >
                      {tf.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Category Section */}
            {editMode && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-border dark:bg-card">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Category
                </Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className={
                        currentCategory?.id === cat.id
                          ? "rounded-xl bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                          : "rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-border dark:text-foreground"
                      }
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Linked Value Section */}
            {editMode && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-border dark:bg-card">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Linked Value
                </Label>
                <select
                  value={habit.linkedValueId ?? ""}
                  onChange={(event) =>
                    linkHabitToValue(habit.id, event.target.value || null)
                  }
                  className="mt-3 flex h-10 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm dark:border-border dark:bg-muted"
                >
                  <option value="">None</option>
                  {values.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.name}
                    </option>
                  ))}
                </select>
              </section>
            )}

            {/* Save Button */}
            <Button
              className="w-full bg-[#8b5cf6] py-6 text-base font-bold text-white hover:bg-[#8b5cf6]/90"
              onClick={() => onOpenChange(false)}
            >
              Save Habit Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
