import { describe, it, expect } from "vitest";
import { mergeAppData } from "@/lib/merge";
import { emptyAppData, type AppData } from "@/lib/schema";
import { buildHabit, buildTodo, buildTimeframe } from "@/test/factories";

function withHabit(updatedAt: number, title: string): AppData {
  const data = emptyAppData();
  data.habits.push(buildHabit({ id: "h1", title, updatedAt, createdAt: 1 }));
  return data;
}

describe("mergeAppData", () => {
  it("keeps the newer habit by updatedAt", () => {
    const current = withHabit(100, "old");
    const incoming = withHabit(200, "new");
    const merged = mergeAppData(current, incoming);
    expect(merged.habits).toHaveLength(1);
    expect(merged.habits[0]?.title).toBe("new");
  });

  it("keeps current when updatedAt is equal", () => {
    const current = withHabit(100, "current");
    const incoming = withHabit(100, "incoming");
    const merged = mergeAppData(current, incoming);
    expect(merged.habits[0]?.title).toBe("current");
  });

  it("never deletes existing history and unions days", () => {
    const current = emptyAppData();
    current.history["2024-01-01"] = { habitStatus: { h1: "done" }, valueEntries: {} };
    const incoming = emptyAppData();
    incoming.history["2024-01-02"] = { habitStatus: { h2: "missed" }, valueEntries: {} };
    const merged = mergeAppData(current, incoming);
    expect(Object.keys(merged.history).sort()).toEqual(["2024-01-01", "2024-01-02"]);
  });

  it("deep merges history for the same day", () => {
    const current = emptyAppData();
    current.history["2024-01-01"] = { habitStatus: { h1: "done" }, valueEntries: { v1: 5 } };
    const incoming = emptyAppData();
    incoming.history["2024-01-01"] = { habitStatus: { h2: "missed" }, valueEntries: { v2: 10 } };
    const merged = mergeAppData(current, incoming);
    const day = merged.history["2024-01-01"]!;
    expect(day.habitStatus.h1).toBe("done");
    expect(day.habitStatus.h2).toBe("missed");
    expect(day.valueEntries.v1).toBe(5);
    expect(day.valueEntries.v2).toBe(10);
  });

  it("adds new timeframes from incoming (union by id)", () => {
    const current = emptyAppData();
    current.timeframes.push(buildTimeframe({ id: "tf-1" }));
    const incoming = emptyAppData();
    incoming.timeframes.push(buildTimeframe({ id: "tf-2" }));
    const merged = mergeAppData(current, incoming);
    expect(merged.timeframes).toHaveLength(2);
  });

  it("does not duplicate existing timeframes", () => {
    const current = emptyAppData();
    current.timeframes.push(buildTimeframe({ id: "tf-1" }));
    const incoming = emptyAppData();
    incoming.timeframes.push(buildTimeframe({ id: "tf-1", name: "Renamed" }));
    const merged = mergeAppData(current, incoming);
    expect(merged.timeframes).toHaveLength(1);
    expect(merged.timeframes[0]!.name).not.toBe("Renamed");
  });

  it("handles empty current with populated incoming", () => {
    const current = emptyAppData();
    const incoming = emptyAppData();
    incoming.habits.push(buildHabit({ id: "h1" }));
    incoming.todos.push(buildTodo({ id: "t1" }));
    const merged = mergeAppData(current, incoming);
    expect(merged.habits).toHaveLength(1);
    expect(merged.todos).toHaveLength(1);
  });

  it("handles populated current with empty incoming", () => {
    const current = emptyAppData();
    current.habits.push(buildHabit({ id: "h1" }));
    const incoming = emptyAppData();
    const merged = mergeAppData(current, incoming);
    expect(merged.habits).toHaveLength(1);
  });

  it("preserves current settings", () => {
    const current = emptyAppData();
    current.settings.theme = "dark";
    const incoming = emptyAppData();
    incoming.settings.theme = "light";
    const merged = mergeAppData(current, incoming);
    expect(merged.settings.theme).toBe("dark");
  });

  it("takes higher version number", () => {
    const current = emptyAppData();
    current.version = 2;
    const incoming = emptyAppData();
    incoming.version = 3;
    const merged = mergeAppData(current, incoming);
    expect(merged.version).toBe(3);
  });
});
