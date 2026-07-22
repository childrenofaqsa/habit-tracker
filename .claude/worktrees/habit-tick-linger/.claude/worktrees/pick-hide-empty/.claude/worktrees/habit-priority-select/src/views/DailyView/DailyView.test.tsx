import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DailyView } from "@/views/DailyView/DailyView";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { emptyAppData } from "@/lib/schema";
import { todayKey } from "@/lib/date";
import { buildTimeframe, buildCategory, buildHabit, buildDayRecord } from "@/test/factories";
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
  Sortable: ({
    children,
  }: {
    children: (handle: { attributes: object; listeners: object; isDragging: boolean }) => React.ReactNode;
  }) => <div>{children({ attributes: {}, listeners: {}, isDragging: false })}</div>,
}));

beforeEach(() => {
  useAppStore.setState({ ...emptyAppData(), hydrated: true } as Partial<StoreState>);
  useUiStore.setState({
    dailyShowCompleted: true,
    dailyShowDiscarded: true,
    dailyShowEmptyCategories: true,
    dailyShowEmptyTimeframes: true,
    dailyPriorityFilter: [],
    searchQuery: "",
  });
});

describe("DailyView", () => {
  it("renders empty state when no timeframes", () => {
    render(<DailyView />);
    expect(screen.getByText("No timeframes yet")).toBeInTheDocument();
  });

  it("renders My Day view by default with timeframe sections", () => {
    const data = emptyAppData();
    data.timeframes.push(buildTimeframe({ id: "tf-1", name: "Morning", order: 0 }));
    data.categories.push(buildCategory({ id: "c-1", timeframeId: "tf-1", order: 0 }));
    data.habits.push(buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }));
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

    render(<DailyView />);
    expect(screen.getByTestId("timeframe-section")).toBeInTheDocument();
    expect(screen.getByText("Morning")).toBeInTheDocument();
  });

  it("switches to All Habits view when toggle clicked", () => {
    const data = emptyAppData();
    data.timeframes.push(buildTimeframe({ id: "tf-1", name: "Morning", order: 0 }));
    data.categories.push(buildCategory({ id: "c-1", timeframeId: "tf-1", order: 0 }));
    data.habits.push(buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }));
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

    render(<DailyView />);
    fireEvent.click(screen.getByText("All Habits"));
    expect(screen.getByTestId("habit-table")).toBeInTheDocument();
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

  it("shows the routine filter controls in Edit Mode but not on My Day", () => {
    const data = emptyAppData();
    data.timeframes.push(buildTimeframe({ id: "tf-1", name: "Morning", order: 0 }));
    data.categories.push(buildCategory({ id: "c-1", timeframeId: "tf-1", order: 0 }));
    data.habits.push(buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }));
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

    const { unmount } = render(<DailyView />);
    expect(screen.queryByText("Show completed")).not.toBeInTheDocument();
    unmount();

    useAppStore.setState({
      settings: { ...useAppStore.getState().settings, editMode: true },
    } as Partial<StoreState>);
    render(<DailyView />);
    expect(screen.getByText("Show completed")).toBeInTheDocument();
    expect(screen.getByText("High priority")).toBeInTheDocument();
  });

  it("hides a fully-completed timeframe on My Day when Show empty timeframes is off", () => {
    const data = emptyAppData();
    data.timeframes.push(buildTimeframe({ id: "tf-1", name: "Morning", order: 0 }));
    data.timeframes.push(buildTimeframe({ id: "tf-2", name: "Evening", order: 1 }));
    data.categories.push(buildCategory({ id: "c-1", timeframeId: "tf-1", order: 0 }));
    data.categories.push(buildCategory({ id: "c-2", timeframeId: "tf-2", order: 0 }));
    data.habits.push(buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }));
    data.habits.push(buildHabit({ id: "h-2", categoryId: "c-2", order: 0 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-1": "done" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    // Timeframe with only a completed habit is "empty" once completed habits are hidden.
    useUiStore.setState({ dailyShowCompleted: false, dailyShowEmptyTimeframes: false });

    render(<DailyView />);
    expect(screen.queryByText("Morning")).not.toBeInTheDocument();
    expect(screen.getByText("Evening")).toBeInTheDocument();
  });

  it("shows every timeframe in Edit Mode even when Show empty timeframes is off", () => {
    const data = emptyAppData();
    data.timeframes.push(buildTimeframe({ id: "tf-1", name: "Morning", order: 0 }));
    data.timeframes.push(buildTimeframe({ id: "tf-2", name: "Evening", order: 1 }));
    data.categories.push(buildCategory({ id: "c-1", timeframeId: "tf-1", order: 0 }));
    data.categories.push(buildCategory({ id: "c-2", timeframeId: "tf-2", order: 0 }));
    data.habits.push(buildHabit({ id: "h-1", categoryId: "c-1", order: 0 }));
    data.habits.push(buildHabit({ id: "h-2", categoryId: "c-2", order: 0 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-1": "done" } });
    data.settings.editMode = true;
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowEmptyTimeframes: false });

    render(<DailyView />);
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Evening")).toBeInTheDocument();
  });
});
