import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAppStore } from "@/store/useAppStore";
import { emptyAppData } from "@/lib/schema";
import { buildTodo, todayStr } from "@/test/factories";
import type { StoreState } from "@/store/types";

vi.mock("@/features/todos/components/EditTodoPage", () => ({
  EditTodoPage: () => <div data-testid="edit-todo-page" />,
}));

vi.mock("@/features/todos/components/EditProjectPage", () => ({
  EditProjectPage: () => <div data-testid="edit-project-page" />,
}));

vi.mock("@/features/todos/components/TodoCard", () => ({
  TodoCard: ({ todo }: { todo: { title: string } }) => (
    <div data-testid="todo-item">{todo.title}</div>
  ),
}));

vi.mock("@/features/todos/components/ProjectCard", () => ({
  ProjectCard: () => <div data-testid="project-card" />,
}));

vi.mock("@/common/components/DateScrollRow", () => ({
  DateScrollRow: () => <div data-testid="date-scroll" />,
}));

const { TodoView } = await import("@/views/TodoView/TodoView");

beforeEach(() => {
  useAppStore.setState({ ...emptyAppData(), hydrated: true } as Partial<StoreState>);
});

describe("TodoView", () => {
  it("renders tabs", () => {
    render(<TodoView />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders today todo card", () => {
    const data = emptyAppData();
    data.todos.push(buildTodo({ id: "t2", title: "Today task", date: todayStr() }));
    useAppStore.setState({ ...data, hydrated: true } as Partial<StoreState>);
    render(<TodoView />);
    expect(screen.getByText("Today task")).toBeInTheDocument();
  });
});
