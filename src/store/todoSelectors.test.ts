import { describe, it, expect } from "vitest";
import { buildTodoBuckets } from "@/store/todoSelectors";
import { buildTodo, todayStr, daysAgo, daysFromNow } from "@/test/factories";

describe("buildTodoBuckets", () => {
  it("routes overdue and undated tasks correctly", () => {
    const todos = [
      buildTodo({ date: "2000-01-01" }),
      buildTodo({ date: null }),
      buildTodo({ date: "2999-01-01" }),
      buildTodo({ completed: true, date: todayStr() }),
    ];
    const buckets = buildTodoBuckets(todos);
    expect(buckets.todayOverdue).toHaveLength(1);
    expect(buckets.scheduled).toHaveLength(2);
    expect(buckets.completed).toHaveLength(1);
  });

  it("returns empty buckets for empty array", () => {
    const buckets = buildTodoBuckets([]);
    expect(buckets.todayOverdue).toHaveLength(0);
    expect(buckets.scheduled).toHaveLength(0);
    expect(buckets.completed).toHaveLength(0);
  });

  it("routes today's date to todayOverdue", () => {
    const todos = [buildTodo({ date: todayStr() })];
    const buckets = buildTodoBuckets(todos);
    expect(buckets.todayOverdue).toHaveLength(1);
  });

  it("sorts todayOverdue by date ascending", () => {
    const todos = [
      buildTodo({ id: "b", date: daysAgo(1) }),
      buildTodo({ id: "a", date: daysAgo(5) }),
    ];
    const buckets = buildTodoBuckets(todos, "createdAt");
    expect(buckets.todayOverdue[0]!.id).toBe("a");
    expect(buckets.todayOverdue[1]!.id).toBe("b");
  });

  it("sorts scheduled by date ascending", () => {
    const todos = [
      buildTodo({ id: "far", date: daysFromNow(10) }),
      buildTodo({ id: "near", date: daysFromNow(1) }),
    ];
    const buckets = buildTodoBuckets(todos, "time");
    expect(buckets.scheduled[0]!.id).toBe("near");
    expect(buckets.scheduled[1]!.id).toBe("far");
  });

  it("sorts completed by completedAt descending (most recent first)", () => {
    const todos = [
      buildTodo({ id: "old", completed: true, completedAt: 100 }),
      buildTodo({ id: "new", completed: true, completedAt: 200 }),
    ];
    const buckets = buildTodoBuckets(todos);
    expect(buckets.completed[0]!.id).toBe("new");
    expect(buckets.completed[1]!.id).toBe("old");
  });

  it("all todos in scheduled when no dates set", () => {
    const todos = [buildTodo(), buildTodo(), buildTodo()];
    const buckets = buildTodoBuckets(todos);
    expect(buckets.scheduled).toHaveLength(3);
    expect(buckets.todayOverdue).toHaveLength(0);
  });
});
