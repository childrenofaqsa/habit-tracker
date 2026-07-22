import { describe, it, expect } from "vitest";
import { buildValue } from "@/test/factories";
import { DIRECT_KEY } from "@/lib/aggregate";
import type { DayRecord, Entity, Field } from "@/lib/schema";
import { buildTrackerAnalysis } from "./trackerAnalysis";

function field(id: string, name: string, order = 0): Field {
  return { id, name, order, createdAt: 1, updatedAt: 1 };
}

function entity(id: string, name: string, fieldIds: string[], order = 0): Entity {
  return { id, name, fieldIds, order, createdAt: 1, updatedAt: 1 };
}

function dayRecord(trackerId: string, text: string): DayRecord {
  return {
    habitStatus: {},
    valueEntries: { [trackerId]: { [DIRECT_KEY]: text } },
  };
}

describe("buildTrackerAnalysis", () => {
  const tracker = buildValue({ id: "kutu", name: "Kutu Meals", type: "text", analyzerEnabled: true });
  const protein = field("f-protein", "Protein", 0);
  const calcium = field("f-calcium", "Calcium", 1);
  const carbs = field("f-carbs", "Carbohydrates", 2);
  const fields = [protein, calcium, carbs];
  const entities = [
    entity("e-rice", "rice", ["f-carbs"]),
    entity("e-fish", "fish", ["f-protein"]),
    entity("e-milk", "milk", ["f-protein", "f-calcium"]),
  ];

  it("counts matched entities per field and lists their names", () => {
    const history: Record<string, DayRecord> = {
      "2025-10-24": dayRecord("kutu", "morning meal : rice, fish 150g, afternoon snack : milk(200 ml)"),
    };
    const result = buildTrackerAnalysis(tracker, fields, entities, history, {});

    const proteinRow = result.fieldRows.find((r) => r.fieldId === "f-protein")!;
    expect(proteinRow.cells["2025-10-24"]).toEqual({ count: 2, entityNames: ["fish", "milk"] });

    const calciumRow = result.fieldRows.find((r) => r.fieldId === "f-calcium")!;
    expect(calciumRow.cells["2025-10-24"]).toEqual({ count: 1, entityNames: ["milk"] });

    const carbsRow = result.fieldRows.find((r) => r.fieldId === "f-carbs")!;
    expect(carbsRow.cells["2025-10-24"]).toEqual({ count: 1, entityNames: ["rice"] });
  });

  it("returns zero count when no entity matches", () => {
    const history: Record<string, DayRecord> = {
      "2025-10-23": dayRecord("kutu", "morning meal : fish 150g, afternoon snack : milk(200 ml)"),
    };
    const result = buildTrackerAnalysis(tracker, fields, entities, history, {});
    const carbsRow = result.fieldRows.find((r) => r.fieldId === "f-carbs")!;
    expect(carbsRow.cells["2025-10-23"]).toEqual({ count: 0, entityNames: [] });
  });

  it("matches case-insensitively", () => {
    const history: Record<string, DayRecord> = {
      "2025-10-22": dayRecord("kutu", "RICE and FISH"),
    };
    const result = buildTrackerAnalysis(tracker, fields, entities, history, {});
    const carbsRow = result.fieldRows.find((r) => r.fieldId === "f-carbs")!;
    expect(carbsRow.cells["2025-10-22"]!.count).toBe(1);
  });

  it("orders date keys newest first", () => {
    const history: Record<string, DayRecord> = {
      "2025-10-22": dayRecord("kutu", "rice"),
      "2025-10-24": dayRecord("kutu", "fish"),
      "2025-10-23": dayRecord("kutu", "milk"),
    };
    const result = buildTrackerAnalysis(tracker, fields, entities, history, {});
    expect(result.dateKeys).toEqual(["2025-10-24", "2025-10-23", "2025-10-22"]);
  });

  it("ignores dates without entries for this tracker", () => {
    const history: Record<string, DayRecord> = {
      "2025-10-24": dayRecord("kutu", "rice"),
      "2025-10-23": { habitStatus: {}, valueEntries: { other: { [DIRECT_KEY]: "milk" } } },
    };
    const result = buildTrackerAnalysis(tracker, fields, entities, history, {});
    expect(result.dateKeys).toEqual(["2025-10-24"]);
  });

  it("uses merged habit-labeled text when no direct override exists", () => {
    const history: Record<string, DayRecord> = {
      "2025-10-24": {
        habitStatus: {},
        valueEntries: { kutu: { "h-1": "rice and fish" } },
      },
    };
    const result = buildTrackerAnalysis(tracker, fields, entities, history, { "h-1": "Lunch" });
    expect(result.valueText["2025-10-24"]).toContain("Lunch : rice and fish");
    const proteinRow = result.fieldRows.find((r) => r.fieldId === "f-protein")!;
    expect(proteinRow.cells["2025-10-24"]!.entityNames).toEqual(["fish"]);
  });

  it("includes a row for every field even with no matches", () => {
    const history: Record<string, DayRecord> = {
      "2025-10-24": dayRecord("kutu", "water only"),
    };
    const result = buildTrackerAnalysis(tracker, fields, entities, history, {});
    expect(result.fieldRows).toHaveLength(3);
    for (const row of result.fieldRows) {
      expect(row.cells["2025-10-24"]).toEqual({ count: 0, entityNames: [] });
    }
  });
});
