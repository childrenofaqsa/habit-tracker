import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailyView } from "@/views/DailyView/DailyView";
import { useAppStore } from "@/store/useAppStore";
import { emptyAppData } from "@/lib/schema";
import { buildTimeframe, buildCategory, buildHabit } from "@/test/factories";
import type { StoreState } from "@/store/types";

vi.mock("@/common/hooks/useCelebration", () => ({
  useCelebration: () => ({ dayComplete: vi.fn(), habitDone: vi.fn() }),
}));

vi.mock("@/common/components/motion/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/habits/components/TimeframeSection", () => ({
  TimeframeSection: ({ timeframe }: { timeframe: { name: string } }) => (
    <div data-testid="timeframe-section">{timeframe.name}</div>
  ),
}));

vi.mock("@/features/habits/components/CategoryFilter", () => ({
  CategoryFilter: () => <div data-testid="category-filter" />,
}));

vi.mock("@/features/habits/components/HabitTable", () => ({
  HabitTable: ({ habits }: { habits: Array<{ id: string }> }) => (
    <div data-testid="habit-table">{habits.length} habits</div>
  ),
}));

vi.mock("@/features/habits/components/EditHabitPage", () => ({
  EditHabitPage: () => <div data-testid="edit-habit-page" />,
}));

vi.mock("@/common/components/FloatingActionButton", () => ({
  FloatingActionButton: () => null,
}));

vi.mock("@/features/values/components/LinkedValueDialog", () => ({
  LinkedValueDialog: () => null,
}));

vi.mock("@/features/editmode/AddInline", () => ({
  AddInline: () => null,
}));

vi.mock("@/features/editmode/DndList", () => ({
  DndList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/editmode/Sortable", () => ({
  Sortable: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

beforeEach(() => {
  useAppStore.setState({ ...emptyAppData(), hydrated: true } as Partial<StoreState>);
});

describe("DailyView", () => {
  it("renders empty state when no timeframes", () => {
    render(<DailyView />);
    expect(screen.getByText("No timeframes yet")).toBeInTheDocument();
  });

  it("renders habit table when data present", () => {
    const data = emptyAppData();
    data.timeframes.push(buildTimeframe({ id: "tf-1", name: "Morning", order: 0 }));
    data.categories.push(buildCategory({ id: "c-1", timeframeId: "tf-1", order: 0 }));
    data.habits.push(buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }));
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

    render(<DailyView />);
    expect(screen.getByTestId("habit-table")).toBeInTheDocument();
    expect(screen.getByText("All Task")).toBeInTheDocument();
  });

  it("does not infinite loop (regression: renders within reasonable time)", () => {
    const data = emptyAppData();
    data.timeframes.push(buildTimeframe({ id: "tf-1", name: "Test", order: 0 }));
    data.habits.push(buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }));
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

    const start = performance.now();
    render(<DailyView />);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });
});
