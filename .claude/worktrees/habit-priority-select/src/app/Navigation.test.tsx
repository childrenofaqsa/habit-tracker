import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navigation } from "@/app/Navigation";
import { useUiStore } from "@/store/useUiStore";

vi.mock("motion/react", () => ({
  motion: {
    span: ({ children, ...props }: Record<string, unknown>) => <span {...props}>{children as React.ReactNode}</span>,
  },
}));

vi.mock("@/common/hooks/useHaptics", () => ({
  useHaptics: () => vi.fn(),
}));

vi.mock("@/common/components/motion/useRipple", () => ({
  useRipple: () => ({ onPointerDown: vi.fn(), rippleLayer: null }),
}));

beforeEach(() => {
  useUiStore.setState({ activeView: "daily" });
});

describe("Navigation", () => {
  it("renders all nav items", () => {
    render(<Navigation orientation="bottom" />);
    expect(screen.getByText("Routine")).toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("marks active view with aria-current", () => {
    render(<Navigation orientation="bottom" />);
    const routineButton = screen.getByText("Routine").closest("button");
    expect(routineButton).toHaveAttribute("aria-current", "page");
  });

  it("clicking nav item calls setActiveView", () => {
    render(<Navigation orientation="bottom" />);
    fireEvent.click(screen.getByText("To Do"));
    expect(useUiStore.getState().activeView).toBe("todo");
  });

  it("supports side orientation", () => {
    render(<Navigation orientation="side" />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
