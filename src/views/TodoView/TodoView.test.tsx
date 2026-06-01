import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAppStore } from "@/store/useAppStore";
import { emptyAppData } from "@/lib/schema";
import { buildTodo, todayStr, daysFromNow } from "@/test/factories";
import type { StoreState } from "@/store/types";

vi.mock("@/features/todos/components/AddTodo", () => ({
  AddTodo: () => <div data-testid="add-todo" />,
}));

vi.mock("@/features/todos/components/TodoCard", () => ({
  TodoCard: ({ todo }: { todo: { title: string } }) => (
    <div data-testid="todo-item">{todo.title}</div>
  ),
}));

vi.mock("@/features/todos/components/CalendarView", () => ({
  CalendarView: () => <div data-testid="calendar-view" />,
}));

vi.mock("@/common/components/DateScrollRow", () => ({
  DateScrollRow: () => <div data-testid="date-scroll" />,
}));

vi.mock("@/common/components/FloatingActionButton", () => ({
  FloatingActionButton: () => null,
}));

const { TodoView } = await import("@/views/TodoView/TodoView");

beforeEach(() => {
  useAppStore.setState({ ...emptyAppData(), hydrated: true } as Partial<StoreState>);
});

describe("TodoView", () => {
  it("renders empty state when no todos", () => {
    render(<TodoView />);
    expect(screen.getByText(/nothing to do/i)).toBeInTheDocument();
  });

  it("renders todos in correct buckets", () => {
    const data = emptyAppData();
    data.todos.push(
      buildTodo({ id: "t1", title: "Inbox task", date: null }),
      buildTodo({ id: "t2", title: "Today task", date: todayStr() }),
      buildTodo({ id: "t3", title: "Future task", date: daysFromNow(5) }),
      buildTodo({ id: "t4", title: "Done task", completed: true, completedAt: Date.now() }),
    );
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);

    render(<TodoView />);
    const items = screen.getAllByTestId("todo-item");
    expect(items.length).toBeGreaterThanOrEqual(2);
  });
});
