import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import {
  selectTimeframes,
  selectCategories,
  selectHabits,
  selectValues,
  selectTodaySummary,
} from "@/store/selectors";
import { emptyAppData } from "@/lib/schema";
import { buildTimeframe, buildCategory, buildHabit, buildValue } from "@/test/factories";
import type { StoreState } from "@/store/types";

beforeEach(() => {
  const data = emptyAppData();
  data.timeframes.push(
    buildTimeframe({ id: "tf-1", name: "Morning", order: 0 }),
  );
  data.categories.push(
    buildCategory({ id: "c-1", timeframeId: "tf-1", order: 0 }),
  );
  data.habits.push(
    buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }),
  );
  data.values.push(
    buildValue({ id: "v-1", order: 0 }),
  );
  useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
});

describe("selector stability with useShallow (regression)", () => {
  it("selectTimeframes returns stable reference with useShallow", () => {
    const { result, rerender } = renderHook(() =>
      useAppStore(useShallow(selectTimeframes)),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("selectCategories returns stable reference with useShallow", () => {
    const { result, rerender } = renderHook(() =>
      useAppStore(useShallow(selectCategories("tf-1"))),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("selectHabits returns stable reference with useShallow", () => {
    const { result, rerender } = renderHook(() =>
      useAppStore(useShallow(selectHabits("c-1"))),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("selectValues returns stable reference with useShallow", () => {
    const { result, rerender } = renderHook(() =>
      useAppStore(useShallow(selectValues)),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("selectTodaySummary returns stable reference with useShallow", () => {
    const { result, rerender } = renderHook(() =>
      useAppStore(useShallow(selectTodaySummary)),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("raw selector produces new reference each call (documents the bug)", () => {
    const state = useAppStore.getState();
    const first = selectTimeframes(state);
    const second = selectTimeframes(state);
    // Same state, but new array reference each time due to .sort() / spread
    // This is WHY useShallow is required - Object.is(first, second) is false
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it("unrelated state change does not cause re-render with useShallow", () => {
    let renderCount = 0;
    renderHook(() => {
      renderCount++;
      return useAppStore(useShallow(selectTimeframes));
    });
    const countAfterMount = renderCount;

    // Mutate something unrelated (settings)
    act(() => {
      useAppStore.getState().setTheme("dark");
    });

    // Should not re-render because timeframes didn't change
    expect(renderCount).toBe(countAfterMount);
  });
});
