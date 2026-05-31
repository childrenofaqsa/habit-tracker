import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { springs } from "@/lib/motionTokens";
import type { Habit } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { selectHabitStatus } from "@/store/selectors";
import { useSelectedDate } from "@/common/hooks/useSelectedDate";
import { useHabitImage } from "@/features/habits/hooks/useHabitImage";
import { useCardGesture } from "@/features/habits/hooks/useCardGesture";
import { useHabitActions } from "@/features/habits/hooks/useHabitActions";
import { HabitDetailSheet } from "@/features/habits/components/HabitCard/HabitDetailSheet";
import { RadialMenu } from "@/features/habits/components/HabitCard/RadialMenu";
import { deleteImage, revokeImageUrl } from "@/storage/imageStore";
import { CARD_SIZE } from "@/features/habits/cardSize";

export function HabitCard({ habit }: { habit: Habit }) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const selectedDate = useSelectedDate();
  const status = useAppStore(selectHabitStatus(habit.id, selectedDate));
  const deleteHabit = useAppStore((state) => state.deleteHabit);
  const imageUrl = useHabitImage(habit.imageId);
  const { toggleDone, forceDone, toggleMissed, uploadImage } = useHabitActions();
  const [detailOpen, setDetailOpen] = useState(false);
  const [radialOpen, setRadialOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const gesture = useCardGesture({
    enabled: true,
    onTap: editMode
      ? () => setDetailOpen(true)
      : () => toggleDone(habit, cardRef.current),
    onLongPress: editMode ? () => setRadialOpen(true) : () => toggleMissed(habit),
    onDoubleTap: editMode ? undefined : () => forceDone(habit, cardRef.current),
  });

  const handleDelete = () => {
    if (habit.imageId) {
      revokeImageUrl(habit.imageId);
      void deleteImage(habit.imageId);
    }
    deleteHabit(habit.id);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        whileTap={{ scale: 0.94 }}
        transition={springs.press}
        {...gesture}
        className={cn(
          CARD_SIZE,
          "snap-card relative flex shrink-0 select-none flex-col items-center justify-center overflow-hidden rounded-2xl border shadow-sm transition-colors duration-200",
          status === "done" && "border-success/50",
          status === "missed" && "border-destructive/50",
          !status && "border-border",
          "bg-card",
        )}
      >
        <div className="flex w-full flex-col items-center justify-center gap-1 px-1">
          <div className="relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className={cn(
                  "size-9 rounded-lg object-cover sm:size-11",
                  status === "done" && "ring-2 ring-success",
                  status === "missed" && "ring-2 ring-destructive",
                )}
              />
            ) : (
              <div
                className={cn(
                  "grid size-9 place-items-center rounded-lg sm:size-11",
                  status === "done" && "bg-success/20 ring-2 ring-success",
                  status === "missed" && "bg-destructive/20 ring-2 ring-destructive",
                )}
              >
                <Sparkles className="size-5 text-muted-foreground" />
              </div>
            )}
            {status === "done" && (
              <div className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-success shadow-sm">
                <Check className="size-2.5 text-success-foreground" strokeWidth={3} />
              </div>
            )}
            {status === "missed" && (
              <div className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-destructive shadow-sm">
                <X className="size-2.5 text-destructive-foreground" strokeWidth={3} />
              </div>
            )}
          </div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setDetailOpen(true);
            }}
            className="line-clamp-2 max-h-8 px-0.5 text-center text-[11px] font-medium leading-tight"
          >
            {habit.title}
          </button>
        </div>

        <RadialMenu
          open={radialOpen}
          onClose={() => setRadialOpen(false)}
          onRename={() => setDetailOpen(true)}
          onReplaceImage={() => fileRef.current?.click()}
          onDelete={handleDelete}
        />
      </motion.div>

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

      <HabitDetailSheet habit={habit} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}
