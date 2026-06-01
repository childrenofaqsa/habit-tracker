import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAppStore } from "@/store/useAppStore";
import { emptyAppData } from "@/lib/schema";
import { buildValue } from "@/test/factories";
import type { StoreState } from "@/store/types";

vi.mock("@/features/values/components/ValueRow", () => ({
  ValueRow: ({ value }: { value: { name: string } }) => (
    <div data-testid="value-card">{value.name}</div>
  ),
}));

vi.mock("@/features/values/components/EditUpdatePage", () => ({
  EditUpdatePage: () => <div>Edit Update Page</div>,
}));

vi.mock("@/features/values/components/CreateTrackerPage", () => ({
  CreateTrackerPage: () => <div>Create Tracker Page</div>,
}));

vi.mock("@/features/values/components/TrackerDetailView", () => ({
  TrackerDetailView: () => <div>Tracker Detail View</div>,
}));

vi.mock("@/features/editmode/DndList", () => ({
  DndList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/editmode/Sortable", () => ({
  Sortable: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const { ValuesView } = await import("@/views/ValuesView/ValuesView");

beforeEach(() => {
  useAppStore.setState({ ...emptyAppData(), hydrated: true } as Partial<StoreState>);
});

describe("ValuesView", () => {
  it("renders empty state when no values", () => {
    render(<ValuesView />);
    expect(screen.getByText(/no trackers yet/i)).toBeInTheDocument();
  });

  it("renders value cards when data present", () => {
    const data = emptyAppData();
    data.values.push(
      buildValue({ id: "v1", name: "Sleep hours", order: 0 }),
      buildValue({ id: "v2", name: "Water intake", order: 1 }),
    );
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

    render(<ValuesView />);
    expect(screen.getAllByTestId("value-card")).toHaveLength(2);
    expect(screen.getByText("Sleep hours")).toBeInTheDocument();
  });

  it("shows Create New button", () => {
    render(<ValuesView />);
    expect(screen.getByText(/create new/i)).toBeInTheDocument();
  });
});
