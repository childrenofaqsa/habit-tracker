import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHabitActions } from "@/features/habits/hooks/useHabitActions";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { emptyAppData } from "@/lib/schema";
import { buildHabit } from "@/test/factories";

// Celebration side effects (confetti/haptics/sound) are irrelevant to the
// linger logic and touch browser APIs, so stub them out.
vi.mock("@/common/hooks/useCelebration", () => ({
  useCelebration: () => ({
    habitDone: vi.fn(),
    habitMissed: vi.fn(),
    timeframeComplete: vi.fn(),
    dayComplete: vi.fn(),
  }),
}));

const habit = buildHabit();

beforeEach(() => {
  vi.useFakeTimers();
  useAppStore.setState({ ...emptyAppData(), hydrated: true });
  useUiStore.setState({ myDayRecentlyToggled: [] });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("useHabitActions linger", () => {
  it("marks a ticked habit as recently toggled, then clears it after the configured delay", () => {
    useAppStore.getState().setMyDayLingerSeconds(30);
    const { result } = renderHook(() => useHabitActions());

    act(() => {
      result.current.toggleDone(habit, null);
    });
    expect(useUiStore.getState().myDayRecentlyToggled).toContain(habit.id);

    // Not yet elapsed.
    act(() => {
      vi.advanceTimersByTime(29_000);
    });
    expect(useUiStore.getState().myDayRecentlyToggled).toContain(habit.id);

    // Window elapses -> cleared.
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(useUiStore.getState().myDayRecentlyToggled).not.toContain(habit.id);
  });

  it("lingers a crossed habit too", () => {
    useAppStore.getState().setMyDayLingerSeconds(10);
    const { result } = renderHook(() => useHabitActions());

    act(() => {
      result.current.toggleMissed(habit);
    });
    expect(useUiStore.getState().myDayRecentlyToggled).toContain(habit.id);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(useUiStore.getState().myDayRecentlyToggled).not.toContain(habit.id);
  });

  it("does not linger when the delay is zero", () => {
    useAppStore.getState().setMyDayLingerSeconds(0);
    const { result } = renderHook(() => useHabitActions());

    act(() => {
      result.current.toggleDone(habit, null);
    });
    expect(useUiStore.getState().myDayRecentlyToggled).not.toContain(habit.id);
  });

  it("refreshes the window instead of stacking timers when re-toggled", () => {
    useAppStore.getState().setMyDayLingerSeconds(30);
    const { result } = renderHook(() => useHabitActions());

    act(() => {
      result.current.toggleDone(habit, null);
    });
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    // Re-toggle restarts the 30s window.
    act(() => {
      result.current.toggleDone(habit, null);
    });
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    // 40s since first toggle but only 20s since the refresh -> still lingering.
    expect(useUiStore.getState().myDayRecentlyToggled).toContain(habit.id);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(useUiStore.getState().myDayRecentlyToggled).not.toContain(habit.id);
  });
});
