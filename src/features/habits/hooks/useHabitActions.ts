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

// Pending linger timers, keyed by habit id, kept outside React state so
// re-renders don't lose them and re-toggling a habit refreshes its window
// instead of stacking timers.
const lingerTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function useHabitActions() {
  const cycleDone = useAppStore((state) => state.cycleHabitDone);
  const cycleMissed = useAppStore((state) => state.cycleHabitMissed);
  const setStatus = useAppStore((state) => state.setHabitStatusToday);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const openValuePrompt = useUiStore((state) => state.openValuePrompt);
  const celebrate = useCelebration();

  const statusOf = (habitId: string) =>
    useAppStore.getState().history[todayKey()]?.habitStatus[habitId];

  // Keep a just-toggled habit visible in its performed state for the
  // configured linger window before the completed/discarded filters hide it.
  const startLinger = useCallback((habitId: string) => {
    const seconds = useAppStore.getState().settings.myDayLingerSeconds;
    const ui = useUiStore.getState();
    const existing = lingerTimers.get(habitId);
    if (existing) clearTimeout(existing);
    if (seconds <= 0) {
      // No linger — filter out immediately (original behavior).
      lingerTimers.delete(habitId);
      ui.clearMyDayRecentlyToggled(habitId);
      return;
    }
    ui.markMyDayRecentlyToggled(habitId);
    const timer = setTimeout(() => {
      lingerTimers.delete(habitId);
      useUiStore.getState().clearMyDayRecentlyToggled(habitId);
    }, seconds * 1000);
    lingerTimers.set(habitId, timer);
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
      startLinger(habit.id);
      if (becomingDone) {
        celebrate.habitDone(element);
        promptLinkedValue(habit);
      }
    },
    [cycleDone, celebrate, promptLinkedValue, startLinger],
  );

  const forceDone = useCallback(
    (habit: Habit, element: HTMLElement | null) => {
      setStatus(habit.id, "done");
      startLinger(habit.id);
      celebrate.habitDone(element);
      promptLinkedValue(habit);
    },
    [setStatus, celebrate, promptLinkedValue, startLinger],
  );

  const toggleMissed = useCallback(
    (habit: Habit) => {
      const becomingMissed = statusOf(habit.id) !== "missed";
      cycleMissed(habit.id);
      startLinger(habit.id);
      if (becomingMissed) celebrate.habitMissed();
    },
    [cycleMissed, celebrate, startLinger],
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
