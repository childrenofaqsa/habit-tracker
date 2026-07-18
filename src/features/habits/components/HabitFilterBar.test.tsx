import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HabitFilterBar } from "@/features/habits/components/HabitFilterBar";
import { useUiStore } from "@/store/useUiStore";

beforeEach(() => {
  useUiStore.setState({ dailyHideCompleted: false, dailyHideEmptyTimeframes: false });
});

describe("HabitFilterBar", () => {
  it("toggles Hide completed and flips its label + aria-pressed", () => {
    render(<HabitFilterBar />);

    const button = screen.getByText("Hide completed");
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);

    expect(useUiStore.getState().dailyHideCompleted).toBe(true);
    expect(screen.getByText("Show completed")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles Hide empty timeframes and flips its label + aria-pressed", () => {
    render(<HabitFilterBar />);

    const button = screen.getByText("Hide empty timeframes");
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);

    expect(useUiStore.getState().dailyHideEmptyTimeframes).toBe(true);
    expect(screen.getByText("Show empty timeframes")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggling one filter does not affect the other", () => {
    render(<HabitFilterBar />);

    fireEvent.click(screen.getByText("Hide completed"));

    expect(useUiStore.getState().dailyHideCompleted).toBe(true);
    expect(useUiStore.getState().dailyHideEmptyTimeframes).toBe(false);
    expect(screen.getByText("Hide empty timeframes")).toBeInTheDocument();
  });
});
