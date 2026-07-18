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
  useUiStore.setState({ dailyHideCompleted: false });
});

describe("HabitRow", () => {
  it("hides completed habits on My Day when Hide completed is on", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-done", categoryId: CATEGORY_ID, title: "Done Habit", order: 0 }));
    data.habits.push(buildHabit({ id: "h-open", categoryId: CATEGORY_ID, title: "Open Habit", order: 1 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyHideCompleted: true });

    renderHabitRow();

    expect(screen.queryByText("Done Habit")).not.toBeInTheDocument();
    expect(screen.getByText("Open Habit")).toBeInTheDocument();
  });

  it("shows completed habits in Edit Mode even when Hide completed is on", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-done", categoryId: CATEGORY_ID, title: "Done Habit", order: 0 }));
    data.habits.push(buildHabit({ id: "h-open", categoryId: CATEGORY_ID, title: "Open Habit", order: 1 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    data.settings.editMode = true;
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyHideCompleted: true });

    renderHabitRow();

    expect(screen.getByText("Done Habit")).toBeInTheDocument();
    expect(screen.getByText("Open Habit")).toBeInTheDocument();
  });

  it("shows a distinct empty message when filtering hides every habit", () => {
    const data = emptyAppData();
    data.habits.push(buildHabit({ id: "h-done", categoryId: CATEGORY_ID, title: "Done Habit", order: 0 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyHideCompleted: true });

    renderHabitRow();

    expect(screen.getByText("All done for today.")).toBeInTheDocument();
  });

  it("shows the default empty message when there are no habits at all", () => {
    renderHabitRow();

    expect(screen.getByText("No habits yet.")).toBeInTheDocument();
  });
});
