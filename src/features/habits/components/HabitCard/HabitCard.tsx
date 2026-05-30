import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { springs } from "@/lib/motionTokens";
import type { Habit } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { selectHabitStatusToday } from "@/store/selectors";
import { useHabitImage } from "@/features/habits/hooks/useHabitImage";
import { useCardGesture } from "@/features/habits/hooks/useCardGesture";
import { useHabitActions } from "@/features/habits/hooks/useHabitActions";
import { CheckMark, CrossMark } from "@/features/habits/components/HabitCard/StatusMarks";
import { HabitDetailSheet } from "@/features/habits/components/HabitCard/HabitDetailSheet";
import { RadialMenu } from "@/features/habits/components/HabitCard/RadialMenu";
import { deleteImage, revokeImageUrl } from "@/storage/imageStore";
import { CARD_SIZE } from "@/features/habits/cardSize";

export function HabitCard({ habit }: { habit: Habit }) {
  const editMode = useAppStore((state) => state.settings.editMode);
  const status = useAppStore(selectHabitStatusToday(habit.id));
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
          status === "done" && "border-success bg-success",
          status === "missed" && "border-destructive bg-destructive",
          !status && "border-border bg-card",
        )}
      >
        {status === "done" && <CheckMark />}
        {status === "missed" && <CrossMark />}
        {!status && (
          <div className="flex w-full flex-col items-center justify-center gap-1 px-1">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="size-9 rounded-lg object-cover sm:size-11"
              />
            ) : (
              <Sparkles className="size-7 text-muted-foreground" />
            )}
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
        )}

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
