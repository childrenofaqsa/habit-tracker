import { useCallback } from "react";
import { toast } from "sonner";
import { todayKey } from "@/lib/date";
import { newId } from "@/lib/id";
import { compressImage } from "@/lib/image";
import type { Habit } from "@/lib/schema";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useCelebration } from "@/common/hooks/useCelebration";
import { deleteImage, putImage, revokeImageUrl } from "@/storage/imageStore";

/**
 * How long a just-toggled habit stays visible on My Day before the
 * completed/discarded filters are allowed to hide it.
 */
const MY_DAY_TOGGLE_GRACE_MS = 2000;

// Pending grace-period timers, keyed by habit id, so re-renders don't lose them
// and re-toggling a habit refreshes its window instead of stacking timers.
const graceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function useHabitActions() {
  const cycleDone = useAppStore((state) => state.cycleHabitDone);
  const cycleMissed = useAppStore((state) => state.cycleHabitMissed);
  const setStatus = useAppStore((state) => state.setHabitStatusToday);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const openValuePrompt = useUiStore((state) => state.openValuePrompt);
  const celebrate = useCelebration();

  const statusOf = (habitId: string) =>
    useAppStore.getState().history[todayKey()]?.habitStatus[habitId];

  const startToggleGrace = useCallback((habitId: string) => {
    const ui = useUiStore.getState();
    ui.markMyDayRecentlyToggled(habitId);
    const existing = graceTimers.get(habitId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      graceTimers.delete(habitId);
      useUiStore.getState().clearMyDayRecentlyToggled(habitId);
    }, MY_DAY_TOGGLE_GRACE_MS);
    graceTimers.set(habitId, timer);
  }, []);

  const promptLinkedValue = useCallback(
    (habit: Habit) => {
      if (habit.linkedValueId) openValuePrompt(habit.linkedValueId, habit.id);
    },
    [openValuePrompt],
  );

  const toggleDone = useCallback(
    (habit: Habit, element: HTMLElement | null) => {
      const becomingDone = statusOf(habit.id) !== "done";
      cycleDone(habit.id);
      startToggleGrace(habit.id);
      if (becomingDone) {
        celebrate.habitDone(element);
        promptLinkedValue(habit);
      }
    },
    [cycleDone, celebrate, promptLinkedValue, startToggleGrace],
  );

  const forceDone = useCallback(
    (habit: Habit, element: HTMLElement | null) => {
      setStatus(habit.id, "done");
      startToggleGrace(habit.id);
      celebrate.habitDone(element);
      promptLinkedValue(habit);
    },
    [setStatus, celebrate, promptLinkedValue, startToggleGrace],
  );

  const toggleMissed = useCallback(
    (habit: Habit) => {
      const becomingMissed = statusOf(habit.id) !== "missed";
      cycleMissed(habit.id);
      startToggleGrace(habit.id);
      if (becomingMissed) celebrate.habitMissed();
    },
    [cycleMissed, celebrate, startToggleGrace],
  );

  const uploadImage = useCallback(
    async (habit: Habit, file: File) => {
      try {
        const blob = await compressImage(file);
        const imageId = newId();
        await putImage(imageId, blob);
        const previous = habit.imageId;
        updateHabit(habit.id, { imageId });
        if (previous) {
          revokeImageUrl(previous);
          await deleteImage(previous);
        }
      } catch {
        toast.error("Could not process that image");
      }
    },
    [updateHabit],
  );

  return { toggleDone, forceDone, toggleMissed, uploadImage };
}
