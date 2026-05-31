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
        className="snap-card relative flex w-16 shrink-0 select-none flex-col items-center rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm dark:border-border dark:bg-card"
      >
        <div
          className={cn(
            "mb-2.5 flex h-[54px] w-12 items-center justify-center rounded-xl",
            status === "done" && "bg-[#19a337]",
            status === "missed" && "bg-[#d92525]",
            !status && "bg-[#f8f9ff] dark:bg-muted",
          )}
        >
          {status === "done" && (
            <Check className="size-7 text-white" strokeWidth={3} />
          )}
          {status === "missed" && (
            <X className="size-7 text-white" strokeWidth={3} />
          )}
          {!status &&
            (imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="size-full rounded-xl object-cover"
              />
            ) : (
              <Sparkles className="size-6 text-black/60 dark:text-muted-foreground" />
            ))}
        </div>
        <span className="line-clamp-2 max-h-7 text-center text-[11px] font-bold leading-tight text-black dark:text-foreground">
          {habit.title}
        </span>

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
