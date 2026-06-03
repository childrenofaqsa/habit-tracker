import { describe, it, expect } from "vitest";
import { emptyAppData, appDataSchema } from "@/lib/schema";

describe("emptyAppData", () => {
  it("creates valid AppData that passes schema", () => {
    const data = emptyAppData();
    const result = appDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("starts with empty arrays", () => {
    const data = emptyAppData();
    expect(data.timeframes).toHaveLength(0);
    expect(data.categories).toHaveLength(0);
    expect(data.habits).toHaveLength(0);
    expect(data.values).toHaveLength(0);
    expect(data.todos).toHaveLength(0);
  });

  it("starts with empty history", () => {
    const data = emptyAppData();
    expect(Object.keys(data.history)).toHaveLength(0);
  });

  it("has default settings", () => {
    const data = emptyAppData();
    expect(data.settings.editMode).toBe(false);
    expect(data.settings.theme).toBe("system");
    expect(data.settings.motion.intensity).toBe("standard");
  });
});

describe("appDataSchema", () => {
  it("rejects data with wrong types", () => {
    const result = appDataSchema.safeParse({ timeframes: "not-an-array" });
    expect(result.success).toBe(false);
  });

  it("rejects habit with missing required fields", () => {
    const data = emptyAppData();
    // @ts-expect-error intentionally passing invalid data
    data.habits.push({ id: "h1" });
    const result = appDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("applies defaults for missing optional fields", () => {
    const result = appDataSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBeDefined();
      expect(result.data.settings.motion.confetti).toBe(true);
    }
  });

  it("validates valid todo with all fields", () => {
    const data = emptyAppData();
    data.todos.push({
      id: "t1",
      title: "Test",
      notes: "",
      date: "2024-06-01",
      priority: "medium" as const,
      tag: "",
      time: null,
      location: null,
      completed: false,
      completedAt: null,
      order: 0,
      projectId: null,
      listId: null,
      status: "todo" as const,
      plan: "",
      goalCurrent: 0,
      goalTarget: 0,
      createdAt: 1000,
      updatedAt: 1000,
    });
    const result = appDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
