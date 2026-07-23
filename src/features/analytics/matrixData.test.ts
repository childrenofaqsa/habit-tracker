import { describe, it, expect } from "vitest";
import type { DayRecord, HabitStatus } from "@/lib/schema";
import { computeGroupCompletion, type MatrixGroup, type MatrixRow } from "./matrixData";

function row(id: string): MatrixRow {
  return { id, name: id, kind: "habit", category: "cat" };
}

function categoryGroup(ids: string[]): MatrixGroup {
  return { id: "cat", name: "Cat", kind: "category", rows: ids.map(row) };
}

function record(statuses: Record<string, HabitStatus>): DayRecord {
  return { habitStatus: statuses, valueEntries: {} };
}

describe("computeGroupCompletion", () => {
  it("divides green ticks by every habit in the category (green + red + unknown)", () => {
    const group = categoryGroup(["a", "b", "c", "d"]);
    // 1 done, 1 missed, 2 untracked -> 1 / 4 = 25%
    const result = computeGroupCompletion(group, record({ a: "done", b: "missed" }));
    expect(result).toBe(25);
  });

  it("counts untracked (unknown) habits in the denominator", () => {
    const group = categoryGroup(["a", "b"]);
    // 1 done, 1 untracked -> 1 / 2 = 50%
    expect(computeGroupCompletion(group, record({ a: "done" }))).toBe(50);
  });

  it("returns 100 when every habit is done", () => {
    const group = categoryGroup(["a", "b"]);
    expect(computeGroupCompletion(group, record({ a: "done", b: "done" }))).toBe(100);
  });

  it("returns 0 when a category has habits but none are done", () => {
    const group = categoryGroup(["a", "b"]);
    expect(computeGroupCompletion(group, record({ a: "missed" }))).toBe(0);
  });

  it("rounds to the nearest whole percent", () => {
    const group = categoryGroup(["a", "b", "c"]);
    // 1 / 3 = 33.33 -> 33
    expect(computeGroupCompletion(group, record({ a: "done" }))).toBe(33);
  });

  it("returns null for a group with no rows", () => {
    const group = categoryGroup([]);
    expect(computeGroupCompletion(group, record({}))).toBeNull();
  });

  it("returns null when the day has no record", () => {
    const group = categoryGroup(["a"]);
    expect(computeGroupCompletion(group, undefined)).toBeNull();
  });

  it("returns null for value groups", () => {
    const group: MatrixGroup = {
      id: "values",
      name: "Values",
      kind: "values",
      rows: [{ id: "v", name: "v", kind: "value" }],
    };
    expect(computeGroupCompletion(group, record({}))).toBeNull();
  });
});
