import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HabitRow } from "@/features/habits/components/HabitRow";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { emptyAppData } from "@/lib/schema";
import { todayKey } from "@/lib/date";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { buildHabit, buildDayRecord } from "@/test/factories";
import type { StoreState } from "@/store/types";

vi.mock("@/features/habits/components/HabitCard/HabitCard", () => ({
  HabitCard: ({ habit }: { habit: { id: string; title: string } }) => (
    <div data-testid={`habit-card-${habit.id}`}>{habit.title}</div>
  ),
}));

vi.mock("@/features/habits/components/AddHabitCard", () => ({
  AddHabitCard: () => null,
}));

vi.mock("@/features/editmode/DndList", () => ({
  DndList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/editmode/Sortable", () => ({
  Sortable: ({
    children,
  }: {
    children: (handle: {
      attributes: object;
      listeners: object;
      isDragging: boolean;
    }) => React.ReactNode;
  }) => <div>{children({ attributes: {}, listeners: {}, isDragging: false })}</div>,
}));

const CATEGORY_ID = "c-1";

function renderHabitRow() {
  return render(
    <SelectedDateProvider value={todayKey()}>
      <HabitRow categoryId={CATEGORY_ID} />
    </SelectedDateProvider>,
  );
}

beforeEach(() => {
  useAppStore.setState({ ...emptyAppData(), hydrated: true } as Partial<StoreState>);
  useUiStore.setState({
    dailyShowCompleted: true,
    dailyShowDiscarded: true,
    dailyShowEmptyCategories: true,
    dailyShowEmptyTimeframes: true,
    dailyPriorityFilter: [],
  });
});

describe("HabitRow", () => {
  it("hides completed habits on My Day when Show completed is off", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-done", categoryId: CATEGORY_ID, title: "Done Habit", order: 0 }));
    data.habits.push(buildHabit({ id: "h-open", categoryId: CATEGORY_ID, title: "Open Habit", order: 1 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowCompleted: false });

    renderHabitRow();

    expect(screen.queryByText("Done Habit")).not.toBeInTheDocument();
    expect(screen.getByText("Open Habit")).toBeInTheDocument();
  });

  it("hides discarded habits on My Day when Show discarded is off", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-missed", categoryId: CATEGORY_ID, title: "Missed Habit", order: 0 }));
    data.habits.push(buildHabit({ id: "h-open", categoryId: CATEGORY_ID, title: "Open Habit", order: 1 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-missed": "missed" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowDiscarded: false });

    renderHabitRow();

    expect(screen.queryByText("Missed Habit")).not.toBeInTheDocument();
    expect(screen.getByText("Open Habit")).toBeInTheDocument();
  });

  it("shows only selected priorities on My Day when a priority filter is active", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-high", categoryId: CATEGORY_ID, title: "High Habit", priority: "high", order: 0 }));
    data.habits.push(buildHabit({ id: "h-low", categoryId: CATEGORY_ID, title: "Low Habit", priority: "low", order: 1 }));
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyPriorityFilter: ["high"] });

    renderHabitRow();

    expect(screen.getByText("High Habit")).toBeInTheDocument();
    expect(screen.queryByText("Low Habit")).not.toBeInTheDocument();
  });

  it("shows completed habits in Edit Mode even when Show completed is off", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-done", categoryId: CATEGORY_ID, title: "Done Habit", order: 0 }));
    data.habits.push(buildHabit({ id: "h-open", categoryId: CATEGORY_ID, title: "Open Habit", order: 1 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    data.settings.editMode = true;
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowCompleted: false });

    renderHabitRow();

    expect(screen.getByText("Done Habit")).toBeInTheDocument();
    expect(screen.getByText("Open Habit")).toBeInTheDocument();
  });

  it("shows a distinct empty message when filtering hides every habit", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-done", categoryId: CATEGORY_ID, title: "Done Habit", order: 0 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowCompleted: false });

    renderHabitRow();

    expect(screen.getByText("Nothing matches your filters.")).toBeInTheDocument();
  });

  it("shows the default empty message when there are no habits at all", () => {
    renderHabitRow();

    expect(screen.getByText("No habits yet.")).toBeInTheDocument();
  });
});
