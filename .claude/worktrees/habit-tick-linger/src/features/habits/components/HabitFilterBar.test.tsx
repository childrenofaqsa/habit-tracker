import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HabitFilterBar } from "@/features/habits/components/HabitFilterBar";
import { useUiStore } from "@/store/useUiStore";
import { useAppStore } from "@/store/useAppStore";

beforeEach(() => {
  useUiStore.setState({
    dailyShowCompleted: true,
    dailyShowDiscarded: true,
    dailyShowEmptyCategories: true,
    dailyShowEmptyTimeframes: true,
    dailyPriorityFilter: [],
  });
  useAppStore.getState().setMyDayLingerSeconds(30);
});

describe("HabitFilterBar", () => {
  it("toggles Show completed", () => {
    render(<HabitFilterBar />);

    const toggle = screen.getByLabelText("Show completed");
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);

    expect(useUiStore.getState().dailyShowCompleted).toBe(false);
  });

  it("toggles Show discarded", () => {
    render(<HabitFilterBar />);

    fireEvent.click(screen.getByLabelText("Show discarded"));

    expect(useUiStore.getState().dailyShowDiscarded).toBe(false);
    expect(useUiStore.getState().dailyShowCompleted).toBe(true);
  });

  it("toggles Show empty category", () => {
    render(<HabitFilterBar />);

    fireEvent.click(screen.getByLabelText("Show empty category"));

    expect(useUiStore.getState().dailyShowEmptyCategories).toBe(false);
    expect(useUiStore.getState().dailyShowEmptyTimeframes).toBe(true);
  });

  it("toggles Show empty timeframes", () => {
    render(<HabitFilterBar />);

    fireEvent.click(screen.getByLabelText("Show empty timeframes"));

    expect(useUiStore.getState().dailyShowEmptyTimeframes).toBe(false);
  });

  it("selects multiple priorities and toggles them off independently", () => {
    render(<HabitFilterBar />);

    const high = screen.getByRole("checkbox", { name: "High priority" });
    const low = screen.getByRole("checkbox", { name: "Low priority" });

    fireEvent.click(high);
    fireEvent.click(low);
    expect(useUiStore.getState().dailyPriorityFilter).toEqual(["high", "low"]);

    fireEvent.click(high);
    expect(useUiStore.getState().dailyPriorityFilter).toEqual(["low"]);
  });

  it("edits the linger duration", () => {
    render(<HabitFilterBar />);

    const input = screen.getByLabelText(
      "Keep ticked/crossed habits visible for",
    ) as HTMLInputElement;
    expect(input.value).toBe("30");

    fireEvent.change(input, { target: { value: "5" } });
    expect(useAppStore.getState().settings.myDayLingerSeconds).toBe(5);
  });

  it("clamps a negative linger duration to zero", () => {
    render(<HabitFilterBar />);

    const input = screen.getByLabelText("Keep ticked/crossed habits visible for");
    fireEvent.change(input, { target: { value: "-3" } });
    expect(useAppStore.getState().settings.myDayLingerSeconds).toBe(0);
  });
});
