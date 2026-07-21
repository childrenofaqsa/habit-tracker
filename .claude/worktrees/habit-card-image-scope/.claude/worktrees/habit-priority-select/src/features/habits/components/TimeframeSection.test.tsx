import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimeframeSection } from "@/features/habits/components/TimeframeSection";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { emptyAppData } from "@/lib/schema";
import { todayKey } from "@/lib/date";
import { SelectedDateProvider } from "@/common/hooks/useSelectedDate";
import { buildCategory, buildHabit, buildDayRecord } from "@/test/factories";
import type { StoreState } from "@/store/types";

vi.mock("@/features/habits/components/CategorySection", () => ({
  CategorySection: ({ category }: { category: { name: string } }) => (
    <div data-testid="category-section">{category.name}</div>
  ),
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

const TIMEFRAME = { id: "tf-1", name: "Morning", order: 0 };

function renderSection() {
  return render(
    <SelectedDateProvider value={todayKey()}>
      <TimeframeSection timeframe={TIMEFRAME} />
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
    timeframeOpen: {},
  });
});

describe("TimeframeSection empty-category filter", () => {
  it("hides a category whose only habit is filtered out when Show empty category is off", () => {
    const data = emptyAppData();
    data.timeframes.push(TIMEFRAME);
    data.categories.push(buildCategory({ id: "c-full", timeframeId: "tf-1", name: "HasOpen", order: 0 }));
    data.categories.push(buildCategory({ id: "c-empty", timeframeId: "tf-1", name: "AllDone", order: 1 }));
    data.habits.push(buildHabit({ id: "h-open", categoryId: "c-full", order: 0 }));
    data.habits.push(buildHabit({ id: "h-done", categoryId: "c-empty", order: 0 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowCompleted: false, dailyShowEmptyCategories: false });

    renderSection();

    expect(screen.getByText("HasOpen")).toBeInTheDocument();
    expect(screen.queryByText("AllDone")).not.toBeInTheDocument();
  });

  it("shows every category when Show empty category is on", () => {
    const data = emptyAppData();
    data.timeframes.push(TIMEFRAME);
    data.categories.push(buildCategory({ id: "c-full", timeframeId: "tf-1", name: "HasOpen", order: 0 }));
    data.categories.push(buildCategory({ id: "c-empty", timeframeId: "tf-1", name: "AllDone", order: 1 }));
    data.habits.push(buildHabit({ id: "h-open", categoryId: "c-full", order: 0 }));
    data.habits.push(buildHabit({ id: "h-done", categoryId: "c-empty", order: 0 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowCompleted: false, dailyShowEmptyCategories: true });

    renderSection();

    expect(screen.getByText("HasOpen")).toBeInTheDocument();
    expect(screen.getByText("AllDone")).toBeInTheDocument();
  });

  it("shows every category in Edit Mode even when Show empty category is off", () => {
    const data = emptyAppData();
    data.timeframes.push(TIMEFRAME);
    data.categories.push(buildCategory({ id: "c-empty", timeframeId: "tf-1", name: "AllDone", order: 0 }));
    data.habits.push(buildHabit({ id: "h-done", categoryId: "c-empty", order: 0 }));
    data.history[todayKey()] = buildDayRecord({ habitStatus: { "h-done": "done" } });
    data.settings.editMode = true;
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    useUiStore.setState({ dailyShowCompleted: false, dailyShowEmptyCategories: false });

    renderSection();

    expect(screen.getByText("AllDone")).toBeInTheDocument();
  });
});
