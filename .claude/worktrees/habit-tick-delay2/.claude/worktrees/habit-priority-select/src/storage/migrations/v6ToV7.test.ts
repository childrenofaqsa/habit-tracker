import { describe, it, expect } from "vitest";
import { migrateV6ToV7 } from "@/storage/migrations/v6ToV7";

describe("migrateV6ToV7", () => {
  it("adds an empty pickedHabitIds list to existing day records", () => {
    const result = migrateV6ToV7({
      version: 6,
      history: {
        "2024-01-01": { habitStatus: { h1: "done" }, valueEntries: {} },
      },
    });
    const history = result.history as Record<string, Record<string, unknown>>;
    expect(history["2024-01-01"]!.pickedHabitIds).toEqual([]);
    expect(history["2024-01-01"]!.habitStatus).toEqual({ h1: "done" });
  });

  it("preserves an existing pickedHabitIds list", () => {
    const result = migrateV6ToV7({
      version: 6,
      history: {
        "2024-01-01": { habitStatus: {}, valueEntries: {}, pickedHabitIds: ["h2"] },
      },
    });
    const history = result.history as Record<string, Record<string, unknown>>;
    expect(history["2024-01-01"]!.pickedHabitIds).toEqual(["h2"]);
  });

  it("handles missing history", () => {
    const result = migrateV6ToV7({ version: 6 });
    expect(result.history).toEqual({});
  });
});
